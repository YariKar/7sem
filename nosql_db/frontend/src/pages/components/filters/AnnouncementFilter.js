import React, { useState, useEffect } from 'react';
import { CustomTextField, CustomButton, CustomDatePicker } from '../CustomMuiComponents.js';

export default function UserFilter(props) {

    const [filterAuthor, setFilterAuthor] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [filterStarsFrom, setFilterStarsFrom] = useState('');
    const [filterStarsTo, setFilterStarsTo] = useState('');
    const [filterTag, setFilterTag] = useState('');

    const handleFilter = (event) => {
        const filter = {
            producer: filterAuthor,
            from_date: filterDateFrom,
            to_date: filterDateTo,
            from_stars: filterStarsFrom,
            to_stars: filterStarsTo,
            tag: filterTag
        };
        props.onSubmit(filter);
    }

    useEffect(() => {
        handleFilter();
    }, []);

    return <>
        <div className='visible-layout flex-column flex-center align-start' style={{padding: '20px', gap: '12px', width: '340px', maxWidth: '340px'}}>
            <div className='caption'>Фильтрация</div>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Автор</div>
            <CustomTextField sx={{width: '100%'}} label="Автор" value={filterAuthor} onChange={(event) => {setFilterAuthor(event.target.value)}}/>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Тег</div>
            <CustomTextField sx={{width: '100%'}} label="Тег" value={filterTag} onChange={(event) => {setFilterTag(event.target.value)}}/>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Число звезд</div>
            <div
                className='flex-row width-full flex-space'
                style={{gap: '5px'}}
            >
                <CustomTextField type="number" label="От" value={filterStarsFrom} onChange={(event) => {setFilterStarsFrom(event.target.value)}}/>
                <CustomTextField type="number" label="До" value={filterStarsTo} onChange={(event) => {setFilterStarsTo(event.target.value)}}/>

            </div>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Дата публикации</div>
            <div
                className='flex-column width-full flex-space'
                style={{gap: '5px'}}
            >
                <CustomDatePicker label="От" onChange={(event) => {setFilterDateFrom(event)}}></CustomDatePicker>
                <CustomDatePicker label="До" onChange={(event) => {setFilterDateTo(event)}}></CustomDatePicker>
            </div>
            <CustomButton variant='contained' sx={{alignSelf: 'end'}} onClick={handleFilter}>Применить</CustomButton>
        </div>
    </>;
}
