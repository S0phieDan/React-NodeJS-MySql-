import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import '../styles/font-awesome-4.7.0/css/font-awesome.min.css';
import '../styles/login.css';

const Login = (props) => {
    const error = "Field can't be empty";
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isWrongUsername, setIsWrongUsername] = useState(false);
    const [errorUsername, setErrorUsername] = useState(error);
    const [isWrongPassword, setIsWrongPassword] = useState(false);
    const [errorPassword, setErrorPassword] = useState(error);
    const maxLengthInput = 51;

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
        }
        else if(value.length >= maxLengthInput) //long name
        {
            setIsWrongPassword(true);
            setErrorPassword("Password is too long");
        }
        else
        {
            setIsWrongPassword(false);
            setErrorPassword("");
            setPassword(value);
        }
    }

    const handleLogin = (e) => {
        e.preventDefault();

        if(!isWrongUsername && !isWrongPassword) //if all false then no errors
        {
            if(username && username.localeCompare('')!==0 && password && password.localeCompare('')!==0)
            {
                const user = {username, password};
                fetch('/api/login', {
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
                    const {msg, success, isAdmin} = data;
                    if(success)
                    {
                        if(isAdmin)
                        {
                            history.push('/vacations/managment');
                        }
                        else
                        {
                            history.push('/vacations');
                        }
                    }
                    else
                    {
                        setIsWrongUsername(true);
                        setErrorUsername(msg);
                        setIsWrongPassword(true);
                        setErrorPassword(msg);
                    }
                });
            }
            else
            {
                if(!username)
                {
                    setIsWrongUsername(true);
                }
                if(!password)
                {
                    setIsWrongPassword(true);
                }  
            }
        }
    }

    const goToRegister = (e) => {
        e.preventDefault();

        props.changeIsLogin();
        props.changeIsRegister();
    }

    return (
        <div className="login-fields">
            <h1>Sign In</h1>
            <div className="form-group mt-3">
                <div className="flex-field">
                    <i className="fa fa-user fa-2x"></i>
                    <input type="text" className={!isWrongUsername ? "form-control ml-2" : "form-control ml-2 is-invalid"} id="username" name="username" placeholder="Username" maxLength={maxLengthInput} onChange={e => usernameValidation(e.target.value)} autoComplete="off"/>
                </div>
                <small className="form-text ivnalid-value" style={!isWrongUsername ? {display: 'none'} : {display:'block'}}>{errorUsername}</small>
            </div>
            <div className="form-group">
                <div className="flex-field">
                    <i className="fa fa-lock fa-2x"></i>
                    <input type="password" className={!isWrongPassword ? "form-control ml-2" : "form-control ml-2 is-invalid"} id="password" name="password" placeholder="Password" onChange={e => passwordValidation(e.target.value)} maxLength={maxLengthInput} autoComplete="off"/>
                </div>
                <small className="form-text ivnalid-value" style={!isWrongPassword ? {display: 'none'} : {display:'block'}}>{errorPassword}</small>
            </div>
            <div className="form-group">
                <button type="button" className="btn btn-lg btn-block btn-info" onClick={(e) => handleLogin(e)}>Login</button>

            </div>
            <div className="form-group new-user">
                <span className="mr-2">
                    New user?
                </span>
                <a href="#" onClick={(e) => goToRegister(e)}>Create an account</a>
            </div>
        </div>
    )
}

export default Login;