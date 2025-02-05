import React, { useState, useEffect } from 'react';
import { CustomTextField, CustomButton, CustomDatePicker } from '../CustomMuiComponents.js';

export default function UserFilter(props) {
    const [filterName, setFilterName] = useState('');
    const [filterSurname, setFilterSurname] = useState('');
    const [filterTalent, setFilterTalent] = useState('');
    const [filterGroup, setFilterGroup] = useState('');
    const [filterChangeDateFrom, setFilterChangeDateFrom] = useState('');
    const [filterChangeDateTo, setFilterChangeDateTo] = useState('');
    const [filterCreateDateFrom, setFilterCreateDateFrom] = useState('');
    const [filterCreateDateTo, setFilterCreateDateTo] = useState('');
    const [filterStarsFrom, setFilterStarsFrom] = useState('');
    const [filterStarsTo, setFilterStarsTo] = useState('');

    const handleFilter = (event) => {
        const filter = {
            first_name: filterName,
            last_name: filterSurname,
            talents: filterTalent,
            groups: filterGroup,
            from_date: filterChangeDateFrom,
            to_date: filterChangeDateTo,
            from_creation: filterCreateDateFrom,
            to_creation: filterCreateDateTo,
            from_stars: filterStarsFrom,
            to_stars: filterStarsTo
        }
        props.onSubmit(filter);
    }

    useEffect(() => {
        handleFilter();
    }, []);

    return <>
        <div className='visible-layout flex-column flex-center align-start' style={{padding: '20px', gap: '12px', width: '340px'}}>
            <div className='caption'>Фильтрация</div>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Имя</div>
            <CustomTextField sx={{width: '100%'}} label="Имя" value={filterName} onChange={(event) => {setFilterName(event.target.value)}}/>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Фамилия</div>
            <CustomTextField sx={{width: '100%'}} label="Фамилия" value={filterSurname} onChange={(event) => {setFilterSurname(event.target.value)}}/>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Талант</div>
            <CustomTextField sx={{width: '100%'}} label="Талант" value={filterTalent} onChange={(event) => {setFilterTalent(event.target.value)}}/>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Группа</div>
            <CustomTextField sx={{width: '100%'}} label="Группа" value={filterGroup} onChange={(event) => {setFilterGroup(event.target.value)}}/>
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
            <CustomButton variant='contained' sx={{alignSelf: 'end'}} onClick={handleFilter}>Применить</CustomButton>
        </div>
    </>;
}
