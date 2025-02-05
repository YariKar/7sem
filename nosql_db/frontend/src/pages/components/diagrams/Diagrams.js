import React, { useState, useEffect } from 'react';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import UserFilter from '../filters/UserFilter.js';
import GroupFilter from '../filters/GroupFilter.js';
import PlaceFilter from '../filters/PlaceFilter.js';
import AnnouncementFilter from '../filters/AnnouncementFilter.js';

import UserChart from './UserChart.js';
import GroupChart from './GroupChart.js';
import PlaceChart from './PlaceChart.js';
import AnnouncementChart from './AnnouncementChart.js';

import { getUsers, getGroups, getPlaces, getAnnouncements } from '../../../requests/Requests.js';

export default function Diagrams(props) {

    const [entity, setEntity] = useState('user');
    const [entities, setEntities] = useState([]);

    const renderFilter = () => {
        switch (entity) {
            case 'user':
                return <UserFilter
                    onSubmit={(filter) => {
                        getUsers(1, 0, filter).then((response) => {
                            setEntities(response.users_list);
                        });
                    }}
                />
            case 'group':
                return <GroupFilter 
                    onSubmit={(filter) => {
                        getGroups(1, 0, filter).then((response) => {
                            setEntities(response.group_list);
                        });
                    }}
                />
            case 'place':
                return <PlaceFilter 
                    onSubmit={(filter) => {
                        getPlaces(1, 0, filter).then((response) => {
                            setEntities(response.places_list);
                        });
                    }}
                />
            case 'announcement':
                return <AnnouncementFilter 
                    onSubmit={(filter) => {
                        getAnnouncements(1, 0, filter).then((response) => {
                            setEntities(response.announcement_list);
                        });
                    }}
                />
        }
    }

    const renderChart = () => {
        switch (entity) {
            case 'user':
                return <UserChart 
                    entities={entities}
                />
            case 'group':
                return <GroupChart 
                    entities={entities}
                />
            case 'place':
                return <PlaceChart 
                    entities={entities}
                />
            case 'announcement':
                return <AnnouncementChart 
                    entities={entities}
                />
        }
    }

    return <>
        <div
            className='width-full flex-row border-box'
            style={{
                gap: '10px'
            }}
        >
            <div
                className='width-full border-box visible-layout'
                style={{
                    height: '400px'
                }}
            >
                {renderChart()}
            </div>
            <div
                className='flex-column border-box fit-width'
                style={{
                    gap: '10px'
                }}
            >
                <div
                    className='visible-layout border-box'
                    style={{
                        width: '380px',
                        padding: '20px',
                    }}
                >
                    <div
                        className='caption'
                    >
                        Выберите сущность
                    </div>
                    <RadioGroup
                        value={entity}
                        onChange={(event) => {
                            setEntity(event.target.value)
                        }}
                    >
                        <FormControlLabel value="user" control={<Radio />} label="Пользователи"
                            sx={{
                                '& .MuiFormControlLabel-label': {
                                    color: 'var(--text-color)'
                                },
                                '& .MuiSvgIcon-root': {
                                    color: 'var(--primary-color)'
                                }
                            }}
                        />
                        <FormControlLabel value="group" control={<Radio />} label="Группы" 
                            sx={{
                                '& .MuiFormControlLabel-label': {
                                    color: 'var(--text-color)'
                                },
                                '& .MuiSvgIcon-root': {
                                    color: 'var(--primary-color)'
                                }
                            }}
                        />
                        <FormControlLabel value="place" control={<Radio />} label="Места" 
                            sx={{
                                '& .MuiFormControlLabel-label': {
                                    color: 'var(--text-color)'
                                },
                                '& .MuiSvgIcon-root': {
                                    color: 'var(--primary-color)'
                                }
                            }}
                        />
                        <FormControlLabel value="announcement" control={<Radio />} label="Объявления" 
                            sx={{
                                '& .MuiFormControlLabel-label': {
                                    color: 'var(--text-color)'
                                },
                                '& .MuiSvgIcon-root': {
                                    color: 'var(--primary-color)'
                                }
                            }}
                        />
                    </RadioGroup>
                </div>
                {renderFilter()}
            </div>
        </div>
    </>;
}
