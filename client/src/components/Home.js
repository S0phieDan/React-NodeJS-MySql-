import React, {useState} from 'react';
import '../styles/font-awesome-4.7.0/css/font-awesome.min.css';
import '../styles/home.css'
import logo from '../styles/images/page_icon.png'
import Login from './Login';
import Register from './Register';

const Home = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isRegister, setIsRegister] = useState(false);

    const changeIsLogin = () =>{
        setIsLogin(!isLogin);
    }

    const changeIsRegister = () =>{
        setIsRegister(!isRegister);
    }

    return(
        <div className="login">
            <div className="page-content">
                <form className="form-login">
                    <div className="flex-title">
                        <img src={logo} className="logo mr-2" alt="logo"/>
                        <span className="title">
                            ObserVacation
                        </span>
                    </div>
                    {isLogin && <Login changeIsRegister={changeIsRegister} changeIsLogin={changeIsLogin}/>}
                    {isRegister && <Register changeIsRegister={changeIsRegister} changeIsLogin={changeIsLogin}/>}
                </form>
                <div className="image-login">
                    <div>
                        <div className="logo-title">
                            Plan your vacation
                        </div>
                        <ul className="options">
                            <li className="option mr-4">
                                <h2>
                                   Find Vacation
                                </h2>
                            </li>
                            <li className="option mr-4">
                                <h2>
                                    Tag & Follow
                                </h2>
                            </li>
                            <li className="option mr-4">
                                <h2>
                                    Stay Updated
                                </h2>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;