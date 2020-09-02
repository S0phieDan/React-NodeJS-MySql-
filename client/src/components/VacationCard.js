import React, {useState, useEffect} from 'react';
import '../styles/vacationCard.css';


const VacationCard = (props) => {
    const {destination, price, image, start_date, end_date, description, followers, id} = props.vacation;
    const [isFollowed, setIsFollowed] = useState(false);

    useEffect(() => {
        if(props.followingVacations.indexOf(id) !==-1)
        {
            setIsFollowed(true);
        }
        else
        {
            setIsFollowed(false);
        }
        
    }, [props.followingVacations])

    const handleFollow = (e) => {

        props.changeFollowers(id, props.index, !isFollowed);
        setIsFollowed(!isFollowed);

        props.changeFollowingVacations(id, !isFollowed);
        
    }

    return (
        <div className="card m-3">
            <div className="card-header">
                <div className="top-header">
                    <div>
                        <div>{destination}</div>
                        <small className="card-subtitle">Price: {price}$</small>
                    </div>
                    <div className="card-title star">
                        <i className="fa fa-star fa-lg"  style={{color: isFollowed ? '#febc1b': 'white'}} onClick={ (e)=>handleFollow(e)}></i>
                        <div className="num-of-followers">
                            <small>
                                {followers? followers : 0}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
            <div className="vacation-image">
                <img className="v-image" src={'/api/images/'+image} alt="vacation"/>
                <div className="card-body">
                    <p className="card-text">{description}</p>
                </div>
            </div>
            <div className="card-footer">
                <div className="start-date">
                    <i className="fa fa-plane mr-1"></i>
                    Start Date: {new Date(start_date).toLocaleDateString("en-GB")}
                </div>
                <div className="end-date">
                    <i className="fa fa-plane fa-rotate-90 mr-1"></i>
                    End Date: {new Date(end_date).toLocaleDateString("en-GB")}
                </div>
            </div>
        </div>
    )
}

export default VacationCard;
