import React, {useState, useRef} from 'react';
import '../styles/edit_vacation.css'

const EditVacationCardManagment = (props) => {
    const error = "Field can't be empty";
    const {destination, price, image, start_date, end_date, description, id} = props.vacation;
    
    const [newDestination, setNewDestination] = useState(destination);
    const [isWrongDestination, setIsWrongDestination] = useState(false);
    const [errorDestination, setErrorDestination] = useState(error);

    const [newPrice, setNewPrice] = useState(price);
    const [isWrongPrice, setIsWrongPrice] = useState(false);
    const [errorPrice, setErrorPrice] = useState(error);

    const [newDescription, setNewDescription] = useState(description);
    const [isWrongDescription, setIsWrongDescription] = useState(false);
    const [errorDescription, setErrorDescription] = useState(error);
    
    const [newImage, setNewImage] = useState(image);
    
    const [newStartDate, setNewStartDate] = useState(new Date(start_date).getFullYear()+'-'+new Date(start_date).getMonth()+'-'+new Date(start_date).getDate());
    const [isWrongStartDate, setIsWrongStartDate] = useState(false);
    const [errorStartDate, setErrorStartDate] = useState('Wrong date format');
    
    const [newEndDate, setNewEndDate] = useState(new Date(end_date).getFullYear()+'-'+new Date(end_date).getMonth()+'-'+new Date(end_date).getDate());
    const [isWrongEndDate, setIsWrongEndDate] = useState(false);
    const [errorEndDate, setErrorEndDate] = useState('Wrong date format');

    const imageRef = useRef();

    const maxLengthInput = 50;
    const maxLengthPrice = 10000000;
    const maxLengthTextArea = 400;

    const handleNewImage = (e) => {
        e.preventDefault();

        const files = imageRef.current.files;

        if(files.length)
        {
            const fd = new FormData();
            fd.append('image', files[0]);

            fetch(`/api/images`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            body: fd
            })
            .then(response => response.json())
            .then(data => setNewImage(data));
        } 
    }

    const close = (e) => {
        props.closeEditMode();
    }

    const save = (e) => {
        const new_vacation = {description: newDescription, destination: newDestination, image: newImage,  start_date: newStartDate, end_date: newEndDate, price: newPrice, id:id, index: props.index};
        props.udpateVacationInDB(new_vacation);
        props.closeEditMode();
    }

    const destinationValidation = (value) => {
        if(value.localeCompare('') === 0) //empty
        {
            setIsWrongDestination(true);
            setErrorDestination("Field can't be empty");
            setNewDestination(value);
        }
        else if(value.length >= maxLengthInput) //long name
        {
            setIsWrongDestination(true);
            setErrorDestination("Destination is too long");
        }
        else
        {
            setIsWrongDestination(false);
            setErrorDestination("");
            setNewDestination(value);
        }
    }

    const priceValidation = (value) => {
        if(value.localeCompare('') === 0) //empty
        {
            setIsWrongPrice(true);
            setErrorPrice("Field can't be empty");
            setNewPrice(0);
        }
        else if(value >= maxLengthPrice || value < 0) //long price
        {
            setIsWrongPrice(true);
            setErrorPrice("Wrong Price. Enter between 0 - 10,000,000");
        }
        else
        {
            setIsWrongPrice(false);
            setErrorPrice("");
            setNewPrice(value);
        }
    }

    const descriptionValidation = (value) => {
        if(value.localeCompare('') === 0) //empty
        {
            setIsWrongDescription(true);
            setErrorDescription("Field can't be empty");
            setNewDescription(value);
        }
        else if(value.length >= maxLengthTextArea) //long name
        {
            setIsWrongDescription(true);
            setNewDescription("Description is too long");
        }
        else
        {
            setIsWrongDescription(false);
            setErrorDescription("");
            setNewDescription(value);
        }
    }

    const startDateValidation = (value) => {
        const d = new Date(value).getTime();
        if(d < 0 || d === NaN)
        {
            setIsWrongStartDate(true);
            setErrorStartDate("Wrong date format");
        }
        else if((new Date(value)).getTime() > (new Date(newEndDate)).getTime()) 
        {
            setIsWrongStartDate(true);
            setErrorStartDate("Start date must be before End date");
        }
        else
        {
            setIsWrongStartDate(false);
            setErrorStartDate("");
            setNewStartDate(value);
        }
    }

    const endDateValidation = (value) => {
        const d = new Date(value).getTime();
        if(d < 0 || d === NaN)
        {
            setIsWrongEndDate(true);
            setErrorEndDate("Wrong date format");
        }
        else if((new Date(value)).getTime() < (new Date(newStartDate)).getTime()) 
        {
            setIsWrongEndDate(true);
            setErrorEndDate("End date must be after Start date");
        }
        else
        {
            setIsWrongEndDate(false);
            setErrorEndDate("");
            setNewEndDate(value);
        }
    }

    return (
        <div className="card m-3">
                <div className="card-header">
                    <div className="top-header">
                        <div>
                            <div className="mb-2">
                                <input type="text" className={!isWrongDestination ? "form-control" : "form-control is-invalid"} defaultValue={newDestination}  maxLength={maxLengthInput} onChange={(e)=>destinationValidation(e.target.value)}/>
                                <small className="form-text ivnalid-value" style={!isWrongDestination ? {display: 'none'} : {display:'block'}}>{errorDestination}</small>
                            </div>
                            <small className="card-subtitle">
                                <input type="number" className={!isWrongPrice ? "form-control form-control-sm" : "form-control form-control-sm is-invalid"} defaultValue={newPrice} onChange={(e)=>priceValidation(e.target.value)}/>
                            </small>
                            <small className="form-text ivnalid-value" style={!isWrongPrice ? {display: 'none'} : {display:'block'}}>{errorPrice}</small>
                        </div>
                        <div className="card-title ellipsis">
                            <i className="fa fa-check-square fa-lg ml-2 mr-2" aria-hidden="true" onClick={(e) => save(e)}></i>
                            <i className="fa fa-window-close fa-lg" onClick={(e) => close(e)}></i>
                        </div>
                    </div>
                </div>
                <div className="insert-image">
                    <div className="card-body-insert">
                        <p className="card-text">
                            <img  className="v-image-insert" src={`/api/images/${newImage}`} alt=''/>
                            <input type="file" className="form-control-file" id="imageInput" aria-describedby="fileHelp" ref={imageRef} onChange={(e)=>handleNewImage(e)}/>
                            <small id="fileHelp" className="form-text text-muted">Choose new image for this vacation.</small>   
                            <textarea  className={!isWrongDescription ? "form-control" : "form-control is-invalid"} rows="4" defaultValue={newDescription}  onChange={(e)=>descriptionValidation(e.target.value)}/>
                            <small className="form-text ivnalid-value" style={!isWrongDescription ? {display: 'none'} : {display:'block'}}>{errorDescription}</small>
                        </p>
                    </div>
                </div>
                <div className="card-footer footer-insert">
                    <div className="start-date-insert mb-1">
                        <i className="fa fa-plane mr-1"></i>
                        Start Date: <b>{new Date(newStartDate).toLocaleDateString("en-GB")}</b>
                        <input type="date" className={!isWrongStartDate ? "form-control insert-start-date" : "form-control insert-start-date is-invalid"} onChange={(e)=>startDateValidation(e.target.value)}/>
                        <small className="form-text ivnalid-value" style={!isWrongStartDate ? {display: 'none'} : {display:'block'}}>{errorStartDate}</small>
                    </div>
                    <div className="end-date-insert">
                        <i className="fa fa-plane   fa-rotate-90 mr-1"></i>
                        End Date: <b>{new Date(newEndDate).toLocaleDateString("en-GB")}</b>
                        <input type="date" className={!isWrongEndDate ? "form-control insert-start-date" : "form-control insert-start-date is-invalid"}  onChange={(e)=>endDateValidation(e.target.value)}/>
                        <small className="form-text ivnalid-value" style={!isWrongEndDate ? {display: 'none'} : {display:'block'}}>{errorEndDate}</small>
                    </div>
                </div>
        </div>
    )
}

export default EditVacationCardManagment;