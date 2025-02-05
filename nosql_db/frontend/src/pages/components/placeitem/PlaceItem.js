import './PlaceItem.css';

import React, { useState, useEffect, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Dropdown } from '../CustomMuiComponents.js';

import { UserContext } from '../../../contexts/UserContext.js';

export default function PlaceItem(props) {

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
                <div className='important-text'>
                    {props.name}
                </div>
                <div className='text'>
                    {props.type} 
                </div>
                <div className='text'>
                    {props.address} 
                </div>
                <div className='text'>
                    {props.number} 
                </div>
                <div className='text'>
                    {props.area} 
                </div>
                <Dropdown
                    label="Оборудование"
                >
                    {Object.keys(props.equipment).map((key) => {
                        return <div key={key}>{key} {props.equipment[key]}</div>;
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
                </div>
            </div>
        </div>
    </>;
}
