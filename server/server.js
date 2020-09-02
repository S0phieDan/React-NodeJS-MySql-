const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const {pool} = require('./mysql');
const PORT = 5000 || process.env.PORT;
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');
const {json} = require('express');
const {v4: uuid4} = require('uuid');
const path = require('path');
const multer  = require('multer');
const moment = require('moment');

const maxLengthInput = 51;
const storage = multer.diskStorage({
    destination:path.join(__dirname, 'upload'),
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, uuid4() + ext);
    }
})
const upload = multer({ storage: storage });
//Session
const appSession = session({
    name: 'sessionID',
    secret: 'sdA6sdncWfsd34995235@1!',
    resave: false,
    saveUninitialized: false,
    cookie:{
        httpOnly: true,
        maxAge: 1000 * 60 * 60 //1 hour
    }
});

const isAuth = (req, res, next) => {
    if(req.session.user) return next();
    res.json({success: false});
}

const isAuthAdmin = (req, res, next) => {
    if(req.session.user)
    {
        const {username} = req.session.user;

        pool.query(`
        SELECT 
            username
        FROM
            users
        WHERE
            isAdmin;
        `,(err, results)=>{
            if(err) throw err;

            if(results.length){
                if(username.localeCompare(results[0].username) === 0)
                {
                    return next();
                }
                else
                {
                    res.json({success: false});
                }
            }
        })
    }
    else
    {
        res.json({success: false});
    }
}

//Middlewares
app.use(appSession);
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(json());
app.use('/', express.urlencoded({extended: false}));
app.use('/api/images', express.static('./upload'));
io.use((socket, next) => {
    appSession(socket.request, {}, next);
});

io.use((socket, next) => {
    if(socket.request.session.user) return next();

    socket.disconnect();
});

//Socket Io
io.on('connection', (socket) => {
    console.log(`New client id: ${socket.id}`);
    
    socket.on('sendFollowers', (data) => {
        const {id, index, isFollowing} = data;
        const {id:id_user} = socket.request.session.user;

        if(id && index && id_user && Number.isInteger(id) && Number.isInteger(index) && Number.isInteger(id_user))
        {
            if(isFollowing)
            {
                pool.query(`
                INSERT INTO vacations_followers (id_vacation, id_follower)
                VALUES (?,?);
                `,[id, id_user], (err, res) => {
                    if(err) throw err;

                    pool.query(`
                        SELECT 
                            COUNT(id_follower) AS followers
                        FROM
                            vacations_followers
                        WHERE 
                            id_vacation = ?
                        GROUP BY id_vacation;
                        `,[id], (error, results) => {
                        if(error) throw error;

                        if(results.length){
                            const {followers} = results[0];

                            pool.query(`
                                SELECT 
                                    id_vacation, COUNT(id_follower) AS followers
                                FROM
                                    vacations_followers
                                GROUP BY id_vacation
                                `, (err, results) => {
                                    if(err) throw err;

                                    if(results.length)
                                    {
                                        io.emit('senDataChart', results);
                                        io.emit('getFollowers', {followers, index, id});
                                    }
                                }
                            )
                        }
                    })
                })
            }
            else
            {
                pool.query(`
                DELETE FROM obser_vacation.vacations_followers 
                WHERE
                    id_vacation = ? AND id_follower = ?;
                `,[id, id_user], (err, res) => {
                    if(err) throw err;

                    pool.query(`
                        SELECT 
                            COUNT(id_follower) AS followers
                        FROM
                            vacations_followers
                        WHERE 
                            id_vacation = ?
                        GROUP BY id_vacation;
                        `,[id], (error, results) => {
                        if(error) throw error;

                        if(results.length){
                            const {followers} = results[0];
                            pool.query(`
                                SELECT 
                                    id_vacation, COUNT(id_follower) AS followers
                                FROM
                                    vacations_followers
                                GROUP BY id_vacation
                                `, (err, results) => {
                                    if(err) throw err;

                                    if(results.length)
                                    {
                                        socket.to('admin_room').emit('senDataChart', results);
                                        io.emit('getFollowers', {followers, index});
                                    }
                                }
                            )
                        }
                        else
                        {
                            pool.query(`
                                SELECT 
                                    id_vacation, COUNT(id_follower) AS followers
                                FROM
                                    vacations_followers
                                GROUP BY id_vacation
                                `, (err, results) => {
                                    if(err) throw err;

                                    if(results.length)
                                    {
                                        socket.to('admin_room').emit('senDataChart', results);
                                        io.emit('getFollowers', {followers: 0, index});
                                    }
                                }
                            )
                        }
                    })
                })
            }
        }
    })

    socket.on('deleteVacation', (data)=>{
        const {id, index} = data;
        if(id && index && Number.isInteger(id) && Number.isInteger(index))
        {
            if(socket.request.session.user)
            {
                const {username} = socket.request.session.user;
                pool.query(`
                    SELECT 
                        username
                    FROM
                        users
                    WHERE
                        isAdmin;
                    `,(err, results)=>{
                        if(err) throw err;

                        if(results.length){
                            if(username.localeCompare(results[0].username) === 0)
                            {
                                if(id)
                                {
                                    pool.query(`
                                        SELECT 
                                            *
                                        FROM
                                            vacations
                                        WHERE id = ?;
                                    `, [id], (err, results)=>{
                                        if(err) throw err;
                        
                                        if(results.length)
                                        {
                                            pool.query(`
                                                DELETE FROM vacations_followers 
                                                WHERE
                                                    id_vacation = ?
                                            `, [id], (error) => {
                                                if(error) throw error;
                        
                                                pool.query(`
                                                    DELETE FROM vacations 
                                                    WHERE
                                                        id = ?
                                                `,[id], (error)=> {
                                                    if(error) throw error;
                        
                                                    pool.query(`
                                                    SELECT 
                                                        *
                                                    FROM
                                                        vacations
                                                    WHERE id = ?;
                                                    `,[id], (error, results) => {
                                                        if(error) throw error;
                        
                                                        if(!results.length)
                                                        {
                                                            io.emit('delete', {success: true, id:id, index:index});
                                                        }
                                                        else
                                                        {
                                                            io.emit('delete', {success: false});
                                                        }
                                                    })
                                                })
                                            })
                        
                                        }
                                    })
                                }
                            }
                            else
                            {
                                res.json({success: false});
                            }
                        }
                    }
                )  
            }
        }
    })

    socket.on('addVacation', (data) => {
        const {description, destination, image, start_date, end_date, price} = data.vacation;

        if(description && destination && image && start_date && end_date && price)
        {

            if(typeof description === 'string' && typeof destination === 'string' && typeof image === 'string' && Number.isInteger(parseInt(price)))
            {
                if((moment(start_date, 'YYYY-MM-DD', true).format()).localeCompare('Invalid date') !== 0 && (moment(end_date, 'YYYY-MM-DD', true).format()).localeCompare('Invalid date') !== 0) 
                {
                    const date1 = new Date(start_date).getTime();
                    const date2 = new Date(end_date).getTime();

                    if(date2 > date1)
                    {
                        if(socket.request.session.user)
                        {
                            const {username} = socket.request.session.user;
                            pool.query(`
                                SELECT 
                                    username
                                FROM
                                    users
                                WHERE
                                    isAdmin;
                                `,(err, results)=>{
                                    if(err) throw err;

                                    if(results.length){
                                        if(username.localeCompare(results[0].username) === 0)
                                        {
                                            pool.query(`
                                                INSERT INTO vacations (description, destination, image, start_date, end_date, price)
                                                VALUES (?,?,?,?,?,?);
                                                `, [description, destination, image, start_date, end_date, price], (err, results) => {
                                                    if(err) throw err;
                                                    const id = results.insertId;

                                                    pool.query(`
                                                    SELECT 
                                                        *
                                                    FROM
                                                        vacations
                                                    WHERE
                                                        id = ?;
                                                    `,[id], (err, results)=>{
                                                        if(err) throw err;

                                                        io.emit('add',{success: true, vacation: results[0]});
                                                    })
                                                }
                                            )

                                        }
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
    })

    socket.on('updateVacation', (data) => {
        const {description, destination, image, start_date, end_date, price, id, index} = data.vacation;

        if(description && destination && image && start_date && end_date && price && id && index)
        {
            if(typeof description === 'string' && typeof destination === 'string' && typeof image === 'string' && Number.isInteger(parseInt(price)) &&  Number.isInteger(parseInt(id)) && Number.isInteger(parseInt(index)))
            {
                if((moment(start_date, 'YYYY-MM-DD', true).format()).localeCompare('Invalid date') !== 0 && (moment(end_date, 'YYYY-MM-DD', true).format()).localeCompare('Invalid date') !== 0) 
                {
                    const date1 = new Date(start_date).getTime();
                    const date2 = new Date(end_date).getTime();

                    if(date2 > date1)
                    {
                        if(socket.request.session.user)
                        {
                            const {username} = socket.request.session.user;
                            pool.query(`
                                SELECT 
                                    username
                                FROM
                                    users
                                WHERE
                                    isAdmin;
                                `,(err, results)=>{
                                    if(err) throw err;

                                    if(results.length){
                                        if(username.localeCompare(results[0].username) === 0)
                                        {
                                            pool.query(`
                                                UPDATE vacations
                                                SET description = ?,
                                                    destination = ?,
                                                    image = ?,
                                                    start_date = ?,
                                                    end_date = ?,
                                                    price = ?
                                                WHERE id = ?
                                            `,[description, destination, image, start_date, end_date, price, id], (err, res)=>{
                                                if(err) throw err;

                                                pool.query(`
                                                SELECT 
                                                    o.id, description, destination, image, start_date, end_date, price, ob.followers
                                                FROM
                                                    obser_vacation.vacations AS o
                                                LEFT JOIN
                                                (
                                                    SELECT 
                                                        COUNT(id_follower) AS followers, id_vacation
                                                    FROM
                                                        obser_vacation.vacations_followers
                                                    GROUP BY id_vacation
                                                ) AS ob 
                                                ON o.id = ob.id_vacation
                                                WHERE
                                                    id = ?;
                                                `,[id], (error, results)=>{
                                                    if(error) throw err;

                                                    io.emit('update',{success: true, vacation: results[0], index: index});
                                                })
                                            })
                                        }
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
    })

    socket.on('getDataChart', (data) => {
        if(socket.request.session.user)
        {
            const {username} = socket.request.session.user;
            pool.query(`
                SELECT 
                    username
                FROM
                    users
                WHERE
                    isAdmin;
                `,(err, results)=>{
                    if(err) throw err;

                    if(results.length){
                        if(username.localeCompare(results[0].username) === 0)
                        {
                            pool.query(`
                                SELECT 
                                    id_vacation, COUNT(id_follower) AS followers
                                FROM
                                    vacations_followers
                                GROUP BY id_vacation
                                `, (err, results) => {
                                    if(err) throw err;

                                    if(results.length)
                                    {
                                        socket.join('admin_room');
                                        socket.emit('senDataChart', results);
                                    }
                                }
                            )   
                        }
                    }
                }
            )
        }
    })

    socket.on('disconnect', () => {
        console.log(`Connection id ${socket.id} disconnected!`);
    })
})

//Routes
app.post('/api/register',(req, res) => {
    const {first_name, last_name, username, password} = req.body;

    if(isValidValue(first_name) && isValidValue(last_name) && isValidValue(username) && isValidValue(password))
    {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if(err) throw err;

                pool.query(`
                            INSERT INTO users (first_name, last_name, username, password, isAdmin)
                            VALUES (?,?,?,?,?);
                `, [first_name, last_name, username, hash, false], (err, results) => {
                    if(err)
                    {
                        if(err.code === 'ER_DUP_ENTRY')
                        {
                            return res.json({success: false, msg: 'Username already exists, please choose another'});
                        }
                    }
                    
                    res.json({success: true, msg: 'New user was created'});
                })
            });
        });
    }
    else
    {
        res.sendStatus(400);
    }
})

app.post('/api/login', (req, res)=>{
    const {username, password} = req.body;

    if(isValidValue(username) && isValidValue(password))
    {
        pool.query(`
            SELECT 
                password, id, isAdmin
            FROM
                users
            WHERE
                username = ?
        `,[username], (err, results)=>{
            if(err) throw err;

            if(results.length)
            {
                const {password:hash, id, isAdmin} = results[0];

                bcrypt.compare(password, hash, (error, same) => {
                    if(error) throw error;
    
                    if(same)
                    {
                        req.session.user = {username: username, id: id};
                        res.json({success: true, msg: 'Successfully logged in!', isAdmin:isAdmin});
                    }
                    else 
                    {
                        res.json({success: false, msg: 'You have entered an invalid username or password'});
                    }
                })
            }
            else
            {
                res.json({success: false, msg: 'You have entered an invalid username or password'});
            }
        })

    }

})

app.get('/api/authorization', isAuth, (req, res) => {
    const {username} = req.session.user
    res.json({success: true, username: username});
})

app.get('/api/authorization/admin', isAuthAdmin, (req, res) => {
    const {username} = req.session.user
    res.json({success: true, username: username});
})

app.get('/api/vacations', isAuth, (req, res) => {
    pool.query(`
        SELECT 
            o.id, description, destination, image, start_date, end_date, price, ob.followers
        FROM
            obser_vacation.vacations AS o
        LEFT JOIN
        (
            SELECT 
                COUNT(id_follower) AS followers, id_vacation
            FROM
                obser_vacation.vacations_followers
            GROUP BY id_vacation
        ) AS ob 
        ON o.id = ob.id_vacation;
    `, (err, results) => {
        if(err) throw err;

        if(results.length){
            const vacationsList = results;
            const {id} = req.session.user
            pool.query(`
            SELECT 
                id_vacation
            FROM
                vacations_followers
            WHERE
                id_follower = ?
            ORDER BY id_vacation DESC;
            `,[id], (err, results) => {
                if(err) throw err;
                const followingList = results.map((result) => result.id_vacation);

                res.json({vacationsList: vacationsList, followingList: followingList});
            })
        }
    })
})

app.get('/api/vacationsForAdmin', isAuthAdmin, (req, res) => {
    pool.query(`
        SELECT 
            *
        FROM
            obser_vacation.vacations;
    `, (err, results)=>{
        if(err) throw err;
        if(results.length){
            res.json(results);
        }
    })

})

app.route('/api/images', isAuthAdmin)
    .post(upload.single('image'), (req, res)=>{
        res.json(req.file.filename);
    })


//Functions
const isValidValue = (value) => {
    if(value && typeof value === 'string' && value.length < maxLengthInput)
       return true;
    
    return false;
}

http.listen(PORT, () => console.log(`Server running on port: ${PORT}`));