import React, {useState} from 'react';
import EditVacationCardManagment from './EditVacationCardManagment';

const VacationCardManagment = (props) => {
    const {destination, price, image, start_date, end_date, description, id} = props.vacation;
    const [isEdit, setIsEdit] = useState(false);

    const openEditMode = (e) => {
        setIsEdit(true);
    }

    const handleDelete = (e) => {
        e.preventDefault();
        props.deleteVacationFromDB(id, props.index);
    }

    const closeEditMode = (e) => {
        setIsEdit(false);
    }
    
    return (
        <div>
            {isEdit && <EditVacationCardManagment vacation={props.vacation} closeEditMode={closeEditMode} udpateVacationInDB={props.udpateVacationInDB} index={props.index}/>}
            <div className="card m-3" style={{display: (isEdit) ? 'none' : 'block'}}>
                <div className="card-header">
                    <div className="top-header">
                        <div>
                            <div>{destination}</div>
                            <small className="card-subtitle">Price: {price}$</small>
                        </div>
                        <div className="card-title ellipsis">
                            <i className="fa fa-pencil fa-lg mr-2" aria-hidden="true" onClick={(e)=> openEditMode(e)}></i>
                            <i className="fa fa-trash-o fa-lg" aria-hidden="true" onClick={(e)=> handleDelete(e)}></i>
                        </div>
                    </div>
                </div>
                <div className="vacation-image">
                    <img className="v-image" src={'/api/images/'+image} alt="vacation"/>
                    <div className="card-body">
                        <p className="card-text">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="card-footer">
                    <div className="start-date">
                        <i className="fa fa-plane mr-1"></i>
                        Start Date: {new Date(start_date).toLocaleDateString("en-GB")}
                    </div>
                    <div className="end-date">
                        <i className="fa fa-plane   fa-rotate-90 mr-1"></i>
                        End Date: {new Date(end_date).toLocaleDateString("en-GB")}
                    </div>
                </div>
            </div>
        </div>
        
    )
}

export default VacationCardManagment;