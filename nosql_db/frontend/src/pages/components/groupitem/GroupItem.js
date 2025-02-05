import './GroupItem.css';

import React, { useState, useEffect, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Dropdown } from '../CustomMuiComponents.js';
import { NavLink } from 'react-router-dom';

import { UserContext } from '../../../contexts/UserContext.js';
import { ReactComponent as StarIcon } from './assets/star.svg';
import { getGroupStarred, addStarToGroup } from '../../../requests/Requests.js';

export default function GroupItem(props) {

    const [authentifiedUserId, setAuthentifiedUserId] = useContext(UserContext);
    const [starred, setStarred] = useState(false);
    const [starsAmount, setStarsAmount] = useState(props.stars);

    useEffect(() => {
        getGroupStarred(authentifiedUserId, props.groupId).then((response) => {
            setStarred(response);
        });
    }, []);

    const handleStarClick = (event) => {
        if (starred) {
            addStarToGroup(authentifiedUserId, props.groupId).then((response) => {
                setStarred(false);
                setStarsAmount(Number(starsAmount) - 1);
            });
        } else {
            addStarToGroup(authentifiedUserId, props.groupId).then((response) => {
                setStarred(true);
                setStarsAmount(Number(starsAmount) + 1);
            });
        }
    }

    return <>
        <div
            className="visible-layout border-box flex-row width-full"
            style={{
                height: 'fit-content',
                padding: '14px',
                gap: '20px'
            }}
        >
            <div className='fit-width'>
                <div className='avatar-container' style={{width: '80px', height: '80px'}}>
                    <img className='width-full height-full' style={{objectFit: 'cover'}} alt='' src={props.avatar_uri}></img>
                </div>
            </div>
            <div
                className='width-full flex-column'
                style={{
                    gap: '10px'
                }}
            >
                <NavLink to={`/groups/${props.groupId}`} style={{textDecoration: 'none'}}>
                    <div className='important-text'>
                        {props.name}
                    </div>
                </NavLink>
                <Dropdown
                    label="Жанры"
                >
                    {props.genres.map((gener, index) => {
                        return <div key={index}>{gener}</div>;
                    })}
                </Dropdown>
                <Dropdown
                    label="Участники"
                >
                    {props.members.map((member, index) => {
                        return <div key={index}>{member.user.first_name} {member.user.last_name}</div>;
                    })}
                </Dropdown>
            </div>
            <div className='fit-width'>
                <div
                    className='flex-column align-end'
                    style={{
                        gap: '5px'
                    }}
                >
                    <div className='text'>
                        Дата создания: {props.lastEditDate}
                    </div>
                    <div className='text'>
                        Изменено: {props.creationDate}
                    </div>
                    <div className='flex-row align-center flex-center' style={{gap: '5px'}}>
                        <div className='announcement-stars-count'>{starsAmount}</div>
                        <StarIcon
                            style={{
                                stroke: 'var(--primary-color)', 
                                fill: starred ? 'var(--primary-color)' : 'none'
                            }}
                            onClick={handleStarClick}
                        />
                    </div> 
                </div>
            </div>
        </div>
    </>;
}
