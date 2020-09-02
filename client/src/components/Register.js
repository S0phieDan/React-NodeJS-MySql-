import React, {useState} from 'react';
import '../styles/register.css';
import loading from '../styles/images/loading.gif';

const Register = (props) => {
    const error = "Field can't be empty"
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm_password, setConfirmPassword] = useState('');
    const [isWrongFirstName, setIsWrongFirstName] = useState(false);
    const [isWrongLastName, setIsWrongLastName] = useState(false);
    const [isWrongUsername, setIsWrongUsername] = useState(false);
    const [isWrongPassword, setIsWrongPassword] = useState(false);
    const [isWrongConfirmPassword, setIsWrongConfirmPassword] = useState(false);
    const [errorFirstName, setErrorFirstName] = useState(error);
    const [errorLastName, setErrorLastName] = useState(error);
    const [errorUsername, setErrorUsername] = useState(error);
    const [errorPassword, setErrorPassword] = useState(error);
    const [errorConfirmPassword, setErrorConfirmPassword] = useState(error);
    const [passswordClassName, setPasswordClassName] = useState('form-control field');
    const [confirmPassswordClassName, setConfirmPasswordClassName] = useState('form-control field');
    const [loadingClassName, setLoadingClassName] = useState("form-group hide");
    const [creatingAccountClassName, setCreatingAccountClassName] = useState('');
    const [successAccountClassName, setSuccessAccountClassName] = useState('success-account hide');
    const [imageLoadingClassName, setImageLoadingClassName] = useState('loading');
    const maxLengthInput = 51;

    const handleCreateAccount = (e) => {
        e.preventDefault();

        if(!isWrongFirstName && !isWrongLastName && !isWrongUsername&& !isWrongPassword && !isWrongConfirmPassword) //if all false then no errors
        {
            if(first_name && first_name.localeCompare('')!==0 && last_name && last_name.localeCompare('')!==0 && username && username.localeCompare('')!==0 && password && password.localeCompare('')!==0 && confirm_password && confirm_password.localeCompare('')!==0)
            {
                setLoadingClassName('form-group');
                const user = {first_name, last_name, username, password};

                fetch('/api/register', {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user)
                })
                .then(response => response.json())
                .then(data => {
                    const {msg, success} = data;

                    if(success)
                    {
                        setTimeout(function(){
                            setCreatingAccountClassName('hide');
                            setImageLoadingClassName('hide');
                            setSuccessAccountClassName('success-account text-success');

                            setTimeout(function(){ 
                                setLoadingClassName('form-group hide');
                                props.changeIsRegister();
                                props.changeIsLogin();
                            }, 500);
                        },500)
                    }
                    else
                    {
                        setLoadingClassName('hide');
                        setIsWrongUsername(true);
                        setErrorUsername(msg);
                    }
                });
            }
            else
            {
                setLoadingClassName('hide');
                if(!first_name)
                    setIsWrongFirstName(true);
                
                if(!last_name)
                    setIsWrongLastName(true);

                if(!username)
                    setIsWrongUsername(true);
                if(!password)
                {
                    setIsWrongPassword(true);
                    setPasswordClassName('form-control field is-invalid');
                }
                if(!confirm_password)
                {
                    setIsWrongConfirmPassword(true);
                    setConfirmPasswordClassName('form-control field is-invalid');
                }  
            }
        } 
    }

    const firstNameValidation = (value) => {
        if(value.localeCompare('') === 0) //empty name
        {
            setIsWrongFirstName(true);
            setErrorFirstName("Field can't be empty");
            setFirstName(value);
        }
        else if(value.length >= maxLengthInput) //long name
        {
            setIsWrongFirstName(true);
            setErrorFirstName("First Name is too long");
        }
        else
        {
            setIsWrongFirstName(false);
            setErrorFirstName("");
            setFirstName(value);
        }
    }

    const lastNameValidation = (value) => {
        if(value.localeCompare('') === 0) //empty name
        {
            setIsWrongLastName(true);
            setErrorLastName("Field can't be empty");
            setLastName(value);
            
        }
        else if(value.length >= maxLengthInput) //long name
        {
            setIsWrongLastName(true);
            setErrorLastName("Last Name is too long");
        }
        else
        {
            setIsWrongLastName(false);
            setErrorLastName("");
            setLastName(value);
        }
    }

    const usernameValidation = (value) => {
        if(value.localeCompare('') === 0) //empty name
        {
            setIsWrongUsername(true);
            setErrorUsername("Field can't be empty");
            setUsername(value);
        }
        else if(value.length >= maxLengthInput) //long name
        {
            setIsWrongUsername(true);
            setErrorUsername("Username is too long");
        }
        else
        {
            setIsWrongUsername(false);
            setErrorUsername("");
            setUsername(value);
        }
    }

    const passwordValidation = (value) => {
        if(value.localeCompare('') === 0) //empty name
        {
            setIsWrongPassword(true);
            setErrorPassword("Field can't be empty");
            setPassword(value);
            setPasswordClassName('form-control field is-invalid');
        }
        else if(value.length >= maxLengthInput) //long name
        {
            setIsWrongPassword(true);
            setErrorPassword("Password is too long");
            setPasswordClassName('form-control field is-invalid');
        }
        else
        {
            setIsWrongPassword(false);
            setErrorPassword("");
            setPassword(value);
            setPasswordClassName('form-control field is-valid');
        }
    }

    const confirmPasswordValidation = (value) => {
        if(value.localeCompare('') === 0) //empty name
        {
            setIsWrongConfirmPassword(true);
            setErrorConfirmPassword("Field can't be empty");
            setConfirmPassword(value);
            setConfirmPasswordClassName('form-control field is-invalid');
        }
        else if(value.length >= maxLengthInput) //long name
        {
            setIsWrongConfirmPassword(true);
            setErrorConfirmPassword("Password is too long");
            setConfirmPasswordClassName('form-control field is-invalid');
        }
        else if(value.localeCompare(password) === 0) //if passwords matches
        {
            setIsWrongConfirmPassword(false);
            setConfirmPasswordClassName('form-control field is-valid');
            setConfirmPassword(value);
        }
        else
        {
            setIsWrongConfirmPassword(true);
            setErrorConfirmPassword("Passwords don't match");
            setConfirmPassword(value);
            setConfirmPasswordClassName('form-control field is-invalid');
        }
    }

    const goToLogin = (e) => {
        e.preventDefault();

        props.changeIsRegister();
        props.changeIsLogin();
    }

    return (
        <div className="register-fields">
            <h1>Register</h1>
            <div className="form-group mt-3">
                <div className="register-names">
                    <div>
                        <div className="register-field mr-4">
                            <input type="text" className={!isWrongFirstName ? "form-control field" : "form-control field is-invalid"} id="first-name" name="first_name" placeholder="First Name" maxLength={maxLengthInput} onChange={e => firstNameValidation(e.target.value)} autoComplete="off"/>
                        </div>
                        <small className="form-text ivnalid-value" style={!isWrongFirstName ? {display: 'none'} : {display:'block'}}>{errorFirstName}</small>
                    </div>
                    <div>
                        <div className="register-field">
                            <input type="text" className={!isWrongLastName ? "form-control field" : "form-control field is-invalid"} id="last-name" name="last_name" placeholder="Last Name" maxLength={maxLengthInput} onChange={e => lastNameValidation(e.target.value)} autoComplete="off"/>
                        </div>
                        <small className="form-text ivnalid-value" style={!isWrongLastName ? {display: 'none'} : {display:'block'}}>{errorLastName}</small>
                    </div>
                </div>
            </div>
            <div className="form-group mt-3">
                <div className="register-field">
                    <input type="text" className={!isWrongUsername? "form-control field" : "form-control field is-invalid"} id="username" name="username" placeholder="Username" maxLength={maxLengthInput} onChange={e => usernameValidation(e.target.value)} autoComplete="off"/>
                </div>
                <small className="form-text ivnalid-value" style={!isWrongUsername ? {display: 'none'} : {display:'block'}}>{errorUsername}</small>
            </div>
            <div className="form-group">
                <div className="register-field">
                    <input type="password" className={passswordClassName} id="password" name="password" placeholder="Password" maxLength={maxLengthInput} onChange={e => passwordValidation(e.target.value)} autoComplete="off"/>
                </div>
                <small className="form-text ivnalid-value" style={!isWrongPassword ? {display: 'none'} : {display:'block'}}>{errorPassword}</small>
            </div>
            <div className="form-group">
                <div className="register-field">
                    <input type="password" className={confirmPassswordClassName} id="confirm-password" name="confirm_password" placeholder="Confirm Password" maxLength={maxLengthInput} onChange={e => confirmPasswordValidation(e.target.value)} autoComplete="off"/>
                </div>
                <small className="form-text ivnalid-value" style={!isWrongConfirmPassword ? {display: 'none'} : {display:'block'}}>{errorConfirmPassword}</small>
            </div>
            <div className={loadingClassName}>
                <div className="loading-image">
                    <img className={imageLoadingClassName} src={loading} alt="loading"/>
                    <h5 className={creatingAccountClassName}>Creating new account...</h5>
                    <h5 className={successAccountClassName}>Your account has been successfully created!</h5>
                </div>
            </div>
            <div className="form-group">
                <button type="button" className="btn btn-lg btn-block btn-success" onClick={(e) => handleCreateAccount(e)}>Create Account</button>
            </div>
            <div className="form-group new-user">
                <span className="mr-2">
                    Have already an account?
                </span>
                <a href="#" onClick={(e) => goToLogin(e)}>Login Here</a>
            </div>
        </div>
    )
}

export default Register;