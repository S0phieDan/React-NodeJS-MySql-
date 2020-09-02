import React, {useState, useRef} from 'react';
import '../styles/new_vacation.css'

const NewVacation = (props) => {
    const error = "Field can't be empty";
    
    const [description, setDescription] = useState('');
    const [isWrongDescription, setIsWrongDescription] = useState(false);
    const [errorDescription, setErrorDescription] = useState(error);
    
    const [destination, setDestination] = useState('');
    const [isWrongDestination, setIsWrongDestination] = useState(false);
    const [errorDestination, setErrorDestination] = useState(error);
   
    const [image, setImage] = useState('');
    const [isWrongImage, setIsWrongImage] = useState(false);
    const [errorImage, setErrorImage] = useState('Please choose image');
    const imageRef = useRef();
    
    const [startDate, setStartDate] = useState();
    const [isWrongStartDate, setIsWrongStartDate] = useState(false);
    const [errorStartDate, setErrorStartDate] = useState('Wrong date format');

    const [endDate, setEndDate] = useState();
    const [isWrongEndDate, setIsWrongEndDate] = useState(false);
    const [errorEndDate, setErrorEndDate] = useState('Wrong date format');

    const [price, setPrice] = useState(0);
    const [isWrongPrice, setIsWrongPrice] = useState(false);
    const [errorPrice, setErrorPrice] = useState(error);
    
    const maxLengthInput = 50;
    const maxLengthTextArea = 400;
    const maxLengthPrice = 10000000;

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!isWrongDescription && !isWrongDestination && !isWrongImage && !isWrongStartDate && !isWrongEndDate && !isWrongPrice) //if all false then no errors
        {
            console.log("sdfdsfdsf");
            const new_vacation = {description, destination, image,  start_date: startDate, end_date: endDate, price};
            props.addVacationToDB(new_vacation);
            props.handleVacationList(e);
        }
        else
        {
            if(!description)
                setIsWrongDescription(true);
            
            if(!destination)
                setIsWrongDestination(true);

            if(!price)
                setIsWrongPrice(true);
            if(!startDate)
                setIsWrongStartDate(true);
            if(!endDate)
                setIsWrongEndDate(true);
            if(!image)
                setIsWrongImage(true);
        }
    }

    const handleImage = (e) => {
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
            .then(data => {
                setImage(data);
                setIsWrongImage(false);
            });
        } 
    }

    const descriptionValidation = (value) => {
        if(value.localeCompare('') === 0) //empty
        {
            setIsWrongDescription(true);
            setErrorDescription("Field can't be empty");
            setDescription(value);
        }
        else if(value.length >= maxLengthTextArea) //long name
        {
            setIsWrongDescription(true);
            setErrorDescription("Description is too long");
        }
        else
        {
            setIsWrongDescription(false);
            setErrorDescription("");
            setDescription(value);
        }
    }

    const destinationValidation = (value) => {
        if(value.localeCompare('') === 0) //empty
        {
            setIsWrongDestination(true);
            setErrorDestination("Field can't be empty");
            setDestination(value);
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
            setDestination(value);
        }
    }

    const priceValidation = (value) => {
        if(value.localeCompare('') === 0) //empty
        {
            setIsWrongPrice(true);
            setErrorPrice("Field can't be empty");
            setPrice(0);
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
            setPrice(value);
        }
    }

    const startDateValidation = (value) => {
        const d = new Date(value).getTime();
        if(d < 0 || d === NaN)
        {
            setIsWrongStartDate(true);
            setErrorStartDate("Wrong date format");
        }
        else if((new Date(value)).getTime() > (new Date(endDate)).getTime()) 
        {
            setIsWrongStartDate(true);
            setErrorStartDate("Start date must be before End date");
        }
        else
        {
            setIsWrongStartDate(false);
            setErrorStartDate("");
            setStartDate(value);
        }
    }

    const endDateValidation = (value) => {
        const d = new Date(value).getTime();
        if(d < 0 || d === NaN)
        {
            setIsWrongEndDate(true);
            setErrorEndDate("Wrong date format");
        }
        else if((new Date(value)).getTime() < (new Date(startDate)).getTime()) 
        {
            setIsWrongEndDate(true);
            setErrorEndDate("End date must be after Start date");
        }
        else
        {
            setIsWrongEndDate(false);
            setErrorEndDate("");
            setEndDate(value);
        }
    }


    return(
           <form className="vacation-form">
                <fieldset>
                    <div className="form-name">
                        <h3>New Vacation Form</h3>
                    </div>
                    <div className="form-group">
                        <label htmlFor="destination">Destination</label>
                        <input type="text" className={!isWrongDestination ? "form-control" : "form-control is-invalid"} id="destination" placeholder="Enter destination" maxLength={maxLengthInput} onChange={e => destinationValidation(e.target.value)} autoComplete="off"/>
                        <small className="form-text ivnalid-value" style={!isWrongDestination ? {display: 'none'} : {display:'block'}}>{errorDestination}</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Price</label>
                        <input type="number" className={!isWrongPrice ? "form-control" : "form-control is-invalid"} id="price" placeholder="Enter price of vacation" min="0" max="10000000" onChange={(e)=>priceValidation(e.target.value)}/>
                        <small id="PricelHelp" className="form-text text-muted">Enter price in USD $</small>
                        <small className="form-text ivnalid-value" style={!isWrongPrice ? {display: 'none'} : {display:'block'}}>{errorPrice}</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="start-date">Start Date</label>
                        <input type="date" className={!isWrongStartDate ? "form-control" : "form-control is-invalid"} id="start-date" onChange={(e)=>startDateValidation(e.target.value)}/>
                        <small className="form-text ivnalid-value" style={!isWrongStartDate ? {display: 'none'} : {display:'block'}}>{errorStartDate}</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="end-date">End Date</label>
                        <input type="date" className={!isWrongEndDate ? "form-control" : "form-control is-invalid"} id="end-date" onChange={(e)=>endDateValidation(e.target.value)}/>
                        <small className="form-text ivnalid-value" style={!isWrongEndDate ? {display: 'none'} : {display:'block'}}>{errorEndDate}</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleTextarea">Description</label>
                        <textarea className={!isWrongDescription ? "form-control" : "form-control is-invalid"} id="exampleTextarea" rows="3" maxLength={maxLengthTextArea} onChange={(e)=>descriptionValidation(e.target.value)}></textarea>
                        <small className="form-text ivnalid-value" style={!isWrongDescription ? {display: 'none'} : {display:'block'}}>{errorDescription}</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="imageInput">Image</label>
                        {image && <img  className="new-image-vacation" src={`/api/images/${image}`} alt=''/>}
                        <input type="file" className={!isWrongImage ? "form-control-file" : "form-control-file is-invalid"} id="imageInput" aria-describedby="fileHelp" ref={imageRef} onChange={(e)=>handleImage(e)}/>
                        <small id="fileHelp" className="form-text text-muted">Choose image for this vacation.</small>
                        <small className="form-text ivnalid-value" style={!isWrongImage ? {display: 'none'} : {display:'block'}}>{errorImage}</small>
                    </div>
                    <div className="form-group">
                        <button type="button" className="btn btn-success btn-lg" onClick={(e)=>handleSubmit(e)}>Add New Vacation</button>
                    </div>
                </fieldset>
            </form>
    )
}

export default NewVacation;