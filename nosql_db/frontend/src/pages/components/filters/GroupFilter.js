import React, { useState, useEffect } from 'react';
import { CustomTextField, CustomButton, CustomDatePicker } from '../CustomMuiComponents.js';

export default function UserFilter(props) {

    const [filterGroupName, setFilterGroupName] = useState('');
    const [filterGroupGenre, setFilterGroupGenre] = useState('');
    const [filterStarsFrom, setFilterStarsFrom] = useState('');
    const [filterStarsTo, setFilterStarsTo] = useState('');
    const [filterChangeDateFrom, setFilterChangeDateFrom] = useState('');
    const [filterChangeDateTo, setFilterChangeDateTo] = useState('');
    const [filterCreateDateFrom, setFilterCreateDateFrom] = useState('');
    const [filterCreateDateTo, setFilterCreateDateTo] = useState('');
    const [filterGroupMembers, setFilterGroupMembers] = useState('');

    const handleFilter = (event) => {
        const filter = {
            name: filterGroupName,
            genre: filterGroupGenre,
            from_stars: filterStarsFrom,
            to_stars: filterStarsTo,
            from_date: filterChangeDateFrom,
            to_date: filterChangeDateTo,
            from_creation: filterCreateDateFrom,
            to_creation: filterCreateDateTo,
            participant: filterGroupMembers
        };
        props.onSubmit(filter);
    }

    useEffect(() => {
        handleFilter();
    }, []);

    return <>
        <div className='visible-layout flex-column flex-center align-start' style={{padding: '20px', gap: '12px', width: '340px'}}>
            <div className='caption'>Фильтрация</div>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Название</div>
            <CustomTextField sx={{width: '100%'}} label="Название" value={filterGroupName} onChange={(event) => setFilterGroupName(event.target.value)}/>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Жанр</div>
            <CustomTextField sx={{width: '100%'}} label="Жанр" value={filterGroupGenre} onChange={(event) => setFilterGroupGenre(event.target.value)}/>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Участник</div>
            <CustomTextField sx={{width: '100%'}} label="Участник" value={filterGroupMembers} onChange={(event) => setFilterGroupMembers(event.target.value)}/>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Число звезд</div>
            <div
                className='flex-row width-full flex-space'
                style={{gap: '5px'}}
            >
                <CustomTextField type="number" label="От" value={filterStarsFrom} onChange={(event) => setFilterStarsFrom(event.target.value)}/>
                <CustomTextField type="number" label="До" value={filterStarsTo} onChange={(event) => setFilterStarsTo(event.target.value)}/>

            </div>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Дата изменения</div>
            <div
                className='flex-column width-full flex-space'
                style={{gap: '5px'}}
            >
                <CustomDatePicker label="От" onChange={(event) => setFilterChangeDateFrom(event)}></CustomDatePicker>
                <CustomDatePicker label="До" onChange={(event) => setFilterChangeDateTo(event)}></CustomDatePicker>
            </div>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Дата создания</div>
            <div
                className='flex-column width-full flex-space'
                style={{gap: '5px'}}
            >
                <CustomDatePicker label="От" onChange={(event) => setFilterCreateDateFrom(event)}></CustomDatePicker>
                <CustomDatePicker label="До" onChange={(event) => setFilterCreateDateTo(event)}></CustomDatePicker>
            </div>
            <CustomButton variant="contained" sx={{alignSelf: 'end'}} onClick={handleFilter}>Примерить</CustomButton>
        </div>
    </>;
}
