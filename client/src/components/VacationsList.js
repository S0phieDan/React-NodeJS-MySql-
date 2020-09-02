import React, {useState, useEffect, useRef} from 'react';
import {useHistory} from 'react-router-dom';
import '../styles/vacations.css';
import '../styles/bootstrap.min.css'
import logo from '../styles/images/page_icon.png'
import VacationCard from './VacationCard';
import SocketIo from 'socket.io-client';

const VacationList = () => {

    const history = useHistory();
    const [username, setUsername]= useState('');
    const [vacationList, setVacationList]= useState([]); //all vacations
    const [followingVacations, setFollowingVacations] = useState([]); //vacations that user following
    const myIo = useRef();

    useEffect(() => {
        fetch('/api/authorization', {
            method: 'GET',
            mode: 'cors',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if(data.success){
                setUsername(data.username);

                fetch('/api/vacations', {
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                    const {vacationsList, followingList} = data;
                    vacationsList.forEach(vacation => {
                        vacation.start_date = Date.parse(vacation.start_date);
                        vacation.end_date = Date.parse(vacation.end_date); //date in ms
                      });
                    setVacationList(vacationsList);
                    setFollowingVacations(followingList);
                });
            }
            else
            {
                history.push('/');
            }
        })

        myIo.current = SocketIo();

        return () => {
            myIo.current.disconnect();
        }

    }, []);

    useEffect(() => {
        myIo.current.off('getFollowers');
        myIo.current.on('getFollowers', (data) => {
            if(data)
            {
                const {followers, index} = data;

                let newList = [...vacationList];
                if(newList.length)
                {
                    newList[index].followers = followers;
                    setVacationList(newList);
                }
            }
        })

        myIo.current.off('delete');
        myIo.current.on('delete', (msg)=>{
            const {id, index} = msg;
            let array = [...vacationList];
            array.splice(index,1);
            setVacationList(array);
        })

        myIo.current.off('add');
        myIo.current.on('add', (msg) => {
            const {vacation} = msg;
            vacation.start_date = Date.parse(vacation.start_date);
            vacation.end_date = Date.parse(vacation.end_date);
            setVacationList([...vacationList, vacation]);
        })

        myIo.current.off('update');
        myIo.current.on('update', (msg) => {
            const {vacation, index} = msg;
            vacation.start_date = Date.parse(vacation.start_date);
            vacation.end_date = Date.parse(vacation.end_date);
            let array = [...vacationList];
            array[index] = vacation;
            setVacationList(array);
        })
        
    }, [vacationList]);




    const handleLogout = (e) => {
        e.preventDefault();
        history.push('/');
    }

    const changeFollowers = (id, index, isFollowing) => {
        myIo.current.emit('sendFollowers', {id, index, isFollowing});
    }

    const changeFollowingVacations = (id, isFollowed) =>
    {
        if(isFollowed)
        {
            setFollowingVacations([id,...followingVacations]);
            //sortVacationList([id,...followingVacations]);
        }
        else
        {
            const index = followingVacations.indexOf(id);
            let array1 = followingVacations;
            array1.splice(index, 1);
            setFollowingVacations(array1);
            //sortVacationList(array1);
        }
    }
    

    const sortVacationList = (array) => {
        let array1 = [];
        for(let i=0; i<array.length; i++)
        {
            for(let j=0; j<vacationList.length; j++)
            {
                if(array[i] === vacationList[j].id)
                {
                    array1.push(vacationList[j]);
                }
            }
        }
        const array2 = vacationList.filter(vacation => array.indexOf(vacation.id) === -1);
        const array3 = array1.concat(array2);
        setVacationList(array3);
    }

    return(
        <div className="vacations">
            <div className="vacations-header">
                <div className="web-name">
                    <img src={logo} className="logo mr-2" alt="logo"/>
                    <span className="title">
                        ObserVacation
                    </span>
                </div>
                <div className="username">
                    Hello, {username}
                    <div className="logout">
                        <i className="fa fa-sign-out ml-2 fa-lg" aria-hidden="true" onClick={(e) => handleLogout(e)}/>
                        <span className="tooltiptext">Sign-Out</span>
                    </div>
                </div>
            </div>
            <div className="vacations-content">
                <div className="vacation-title">
                    <div className="v-title mr-2">
                        <h2>Vacations List</h2>
                    </div>
                </div>
                <div className="container">
                    {vacationList.map((vacation, index)=>(
                        <VacationCard 
                            key={vacation.id} index={index} 
                            vacation={vacation} 
                            changeFollowers={changeFollowers} 
                            followingVacations={followingVacations} 
                            changeFollowingVacations={changeFollowingVacations}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default VacationList;