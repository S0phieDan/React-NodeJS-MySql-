import React, {useState, useEffect, useRef} from 'react';
import {useHistory} from 'react-router-dom';
import '../styles/vacations.css';
import '../styles/bootstrap.min.css'
import '../styles/vacations_managment.css';
import logo from '../styles/images/page_icon.png'
import NewVacation from './NewVacation';
import VacationCardManagment from './VacationCardManagment';
import SocketIo from 'socket.io-client';
import ChartVictory from './ChartVictory';


const VacationListManagment = () => {

    const history = useHistory();
    const myIo = useRef();
    const [username, setUsername]= useState('');
    const [vacationList, setVacationList]= useState([]); //all vacations
    const [addNewVacation, setAddNewVacation] = useState(false);
    const [reports, setReports] = useState(false);
    const classNameActive = 'active-option option pb-3 mr-4';
    const classNameRegular = 'option pb-3 mr-4';
    const [classNameReports, setClassNameReports] = useState(classNameRegular);
    const [classNameVacationList, setClassNameVacationList] = useState(classNameActive);
    const [classNameNewVacation, setClassNameNewVacation] = useState(classNameRegular);
    
    useEffect(() => {
        fetch('/api/authorization/admin', {
            method: 'GET',
            mode: 'cors',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if(data.success){
                setUsername(data.username);

                fetch('/api/vacationsForAdmin', {
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                    if(data.length)
                    {
                        data.forEach(vacation => {
                            vacation.start_date = Date.parse(vacation.start_date);
                            vacation.end_date = Date.parse(vacation.end_date); //date in ms
                          });
                        setVacationList(data);
                    }
                })
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
        myIo.current.off('delete');
        myIo.current.on('delete', (msg) => {
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
       
    }, [vacationList])

    const deleteVacationFromDB = (idToDelete, index) => {
        myIo.current.emit('deleteVacation', {id: idToDelete, index:index});
    }

    const addVacationToDB = (vacationToAdd) => {
        myIo.current.emit('addVacation', {vacation: vacationToAdd});
    }

    const udpateVacationInDB = (vacationToUpdate) => {
        myIo.current.emit('updateVacation', {vacation: vacationToUpdate});
    }

    const handleLogout = (e) => {
        e.preventDefault();
        history.push('/');
    }

    const handleAddNewVacation = (e) => {
        setAddNewVacation(!addNewVacation);
        setReports(false);
        if(!addNewVacation){
            setClassNameReports(classNameRegular);
            setClassNameNewVacation(classNameActive);
            setClassNameVacationList(classNameRegular);
        }
        else
        {
            setClassNameNewVacation(classNameRegular);
            setClassNameVacationList(classNameActive);
        }

    }

    const handleReports = (e) => {
        setAddNewVacation(false);
        setReports(!reports);
        if(!reports){
            setClassNameReports(classNameActive);
            setClassNameNewVacation(classNameRegular);
            setClassNameVacationList(classNameRegular);
        }
        else
        {
            setClassNameReports(classNameRegular);
            setClassNameVacationList(classNameActive);
        }
        
    }

    const handleVacationList = (e) => {
        setReports(false);
        setAddNewVacation(false);

        setClassNameReports(classNameRegular);
        setClassNameNewVacation(classNameRegular);
        setClassNameVacationList(classNameActive);
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
                    <div className="v-title">
                        <h2>Vacations Managment</h2>
                    </div>
                    <div className="options">
                        <div className={classNameVacationList} onClick={(e)=>handleVacationList(e)}>
                            Vacations List
                            <i className="fa fa fa-list-ul ml-1" aria-hidden="true"></i>
                        </div>
                        <div className={classNameNewVacation} onClick={(e)=>handleAddNewVacation(e)}>
                            New Vacation
                            <i className="fa fa-plus ml-1" aria-hidden="true"></i>
                        </div>
                        <div className={classNameReports} onClick={(e)=>handleReports(e)}>
                            Reports
                            <i className="fa fa-bar-chart ml-1" aria-hidden="true"></i>
                        </div>
                    </div>
                </div>
                <div className="add-vacation selection">
                    {addNewVacation && <NewVacation handleAddNewVacation={handleAddNewVacation} addVacationToDB={addVacationToDB} handleVacationList={handleVacationList}/>}
                </div>
                <div className="reports selection">
                    {reports && <ChartVictory/>}
                </div>
                <div className="container" style={{display: (!addNewVacation && !reports) ? 'flex' : 'none'}}>
                {vacationList.map((vacation, index)=>(
                        <VacationCardManagment 
                            key={vacation.id} index={index} 
                            index={index}
                            vacation={vacation}
                            deleteVacationFromDB={deleteVacationFromDB}
                            udpateVacationInDB={udpateVacationInDB}
                        />
                    ))}
                </div>   
            </div>
        </div>
        
    )
}

export default VacationListManagment;