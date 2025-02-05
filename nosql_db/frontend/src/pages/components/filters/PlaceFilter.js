import React, { useState, useEffect } from 'react';
import { CustomTextField, CustomButton, CustomDatePicker } from '../CustomMuiComponents.js';

export default function UserFilter(props) {

    const [filterPlaceName, setFilterPlaceName] = useState('');
    const [filterPlaceType, setFilterPlaceType] = useState('');
    const [filterPlaceAddress, setFilterPlaceAddress] = useState('');
    const [filterPlaceNumber, setFilterPlaceNumber] = useState('');
    const [filterPlaceEquipment, setFilterPlaceEquipment] = useState('');
    const [filterChangeDateFrom, setFilterChangeDateFrom] = useState('');
    const [filterChangeDateTo, setFilterChangeDateTo] = useState('');
    const [filterCreateDateFrom, setFilterCreateDateFrom] = useState('');
    const [filterCreateDateTo, setFilterCreateDateTo] = useState('');

    const handleFilter = (event) => {
        const filter = {
            name: filterPlaceName,
            type: filterPlaceType,
            address: filterPlaceAddress,
            number: filterPlaceNumber,
            equipment: filterPlaceEquipment,
            from_date: filterChangeDateFrom,
            to_date: filterChangeDateTo,
            from_creation: filterCreateDateFrom,
            to_creation: filterCreateDateTo
        }
        props.onSubmit(filter);
    }

    useEffect(() => {
        handleFilter();
    }, []);

    return <>
        <div className='visible-layout flex-column flex-center align-start' style={{padding: '20px', gap: '12px', width: '340px'}}>
            <div className='caption'>Фильтрация</div>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Название</div>
            <CustomTextField sx={{width: '100%'}} label="Название" value={filterPlaceName} onChange={(event) => setFilterPlaceName(event.target.value)}/>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Тип</div>
            <CustomTextField sx={{width: '100%'}} label="Тип" value={filterPlaceType} onChange={(event) => setFilterPlaceType(event.target.value)}/>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Адрес</div>
            <CustomTextField sx={{width: '100%'}} label="Адрес" value={filterPlaceAddress} onChange={(event) => setFilterPlaceAddress(event.target.value)}/>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Контактный номер</div>
            <CustomTextField sx={{width: '100%'}} label="Контактный номер" value={filterPlaceNumber} onChange={(event) => setFilterPlaceNumber(event.target.value)}/>
            <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Оборудование</div>
            <CustomTextField sx={{width: '100%'}} label="Оборудование" value={filterPlaceEquipment} onChange={(event) => setFilterPlaceEquipment(event.target.value)}/>
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
