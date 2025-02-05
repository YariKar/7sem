import './Authorization.css';


import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { UserContext } from '../../contexts/UserContext.js';
import { authorization, registration } from '../../requests/Requests.js';


const CustomTextField = styled(TextField)(() => ({
    "& input": {
        boxSizing: 'border-box',
        height: '23px',
        fontSize: '16px',
        padding: '0 10px',
        backgroundColor: 'var(--text-color)',
        color: 'var(--base-color)',
        borderRadius: '10px',
    },
    "& fieldset": {
        border: 'none',
        color: 'red',
    },
    "& label.Mui-focused": {
        display: "none"
    },
    "& label.MuiFormLabel-filled": {
        display: "none"
    },
    "& label": {
        transform: 'translate(12px, 20%) scale(0.75)'
    }
}));

const CustomButton = styled(Button)(() => ({
    width: '120px',
    height: '40px',

    backgroundColor: 'var(--primary-color)',
    borderRadius: '10px',

    color: 'var(--contrast-text-color)',
    fontSize: '16px',
    fontWeight: 'normal',
    textTransform: 'none'
}));

const CustomTab = styled(Tab)(() => ({
    "&.Mui-selected": {
        color: 'var(--text-color)',
        fontWeight: 'bold'
    },
    color: 'var(--text-color)',
    borderColorBottom: 'red'
}));

const CustomTabList = styled(TabList)(() => ({
    "& .MuiTabs-indicator": {
        backgroundColor: 'var(--primary-color)'
    }

}))

export default function Authorization(props) {

    const navigate = useNavigate();

    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const handleRegister = () => {
        if (password === repeatPassword) {
            registration(firstName, lastName, email, password)
                .then(response => {
                    localStorage.setItem('userId', response._key);
                    setAuthentifiedUserId(response._key);
                    navigate(`/users/${response._key}`);
                })
                .catch(error => {
                    toast('Введенные данные не соответствуют требованиям!');
                })
        } else {
            toast('Пароли не совпадают!');
        }


    }

    const [authentifiedUserId, setAuthentifiedUserId] = useContext(UserContext);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const handleLogin = () => {
        authorization(loginEmail, loginPassword)
            .then(response => {
                if (response.code === 200) {
                    localStorage.setItem('userId', response.body._key);
                    setAuthentifiedUserId(response.body._key);
                    navigate('/announcements');
                } else {
                    toast("Неверные данные!");
                }
            })
    }

    const [tab, setTab] = React.useState('1');

    const handleChangeTab = (event, newTab) => {
        setTab(newTab);
    };

    return <>
        <div className='flex-column width-full height-full flex-center align-center'>
            <div
                style={{
                    width: '400px',
                    backgroundColor: 'var(--base-color)',
                    borderRadius: '20px',
                }}
            >
        <TabContext
            value={tab}
        >
            <div className='flex-column width-full'>
                <CustomTabList onChange={handleChangeTab} centered>
                    <CustomTab label="Регистрация" value="1" />
                    <CustomTab label="Авторизация" value="2" />
                </CustomTabList>
                <TabPanel value="1">
                    <div className='flex-column align-center' style={{ gap: '20px' }}>
                        <div className='flex-column align-center' style={{ gap: '10px' }}>

                            <CustomTextField label="Фамилия" required variant="outlined" value={lastName} onChange={(event) => { setLastName(event.target.value) }}/>
                            <CustomTextField label="Имя" required variant="outlined" value={firstName} onChange={(event) => { setFirstName(event.target.value) }} />
                            <CustomTextField label="Электронная почта" required type="email" variant="outlined" value={email} onChange={(event) => { setEmail(event.target.value) }} />
                            <CustomTextField label="Пароль" required type="password" variant="outlined" value={password} onChange={(event) => { setPassword(event.target.value) }} />
                            <CustomTextField label="Повторите пароль" required type="password" variant="outlined" value={repeatPassword} onChange={(event) => { setRepeatPassword(event.target.value) }} />

                        </div>

                        <CustomButton variant="contained" type="submit" onClick={handleRegister}>Регистрация</CustomButton>

                    </div>
                </TabPanel>
                <TabPanel value="2">
                    <div className='flex-column align-center' style={{ gap: '20px' }}>
                        <div className='flex-column align-center' style={{ gap: '10px' }}>

                            <CustomTextField label="Электронная почта" required type="email" variant="outlined" value={loginEmail} onChange={(event) => { setLoginEmail(event.target.value) }} />
                            <CustomTextField label="Пароль" required type="password" variant="outlined" value={loginPassword} onChange={(event) => { setLoginPassword(event.target.value) }} />

                        </div>

                        <CustomButton variant="contained" type="submit" onClick={handleLogin}>Вход</CustomButton>

                    </div>
                </TabPanel>

            </div>
        </TabContext>

            </div>

        </div>
    </>;
}
