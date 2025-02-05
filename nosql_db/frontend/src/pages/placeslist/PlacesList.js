import './PlacesList.css';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from "react-router-dom";
import Pagination from '../components/pagination/Pagination.js';
import { CustomTextField, CustomButton, CustomDatePicker } from '../components/CustomMuiComponents.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';

import PlaceItem from '../components/placeitem/PlaceItem.js';
import { getPlaces, createPlace } from '../../requests/Requests.js';

export default function PlacesList(props) {

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const pageSize = 3;
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [places, setPlaces] = useState([]);

    const [newPlaceName , setNewPlaceName] = useState('');
    const [newPlaceType , setNewPlaceType] = useState('');
    const [newPlaceAddress, setNewPlaceAddress] = useState('');
    const [newPlaceNumber, setNewPlaceNumber] = useState('');

    const [filterPlaceName, setFilterPlaceName] = useState('');
    const [filterPlaceType, setFilterPlaceType] = useState('');
    const [filterPlaceAddress, setFilterPlaceAddress] = useState('');
    const [filterPlaceNumber, setFilterPlaceNumber] = useState('');
    const [filterPlaceEquipment, setFilterPlaceEquipment] = useState('');
    const [filterChangeDateFrom, setFilterChangeDateFrom] = useState('');
    const [filterChangeDateTo, setFilterChangeDateTo] = useState('');
    const [filterCreateDateFrom, setFilterCreateDateFrom] = useState('');
    const [filterCreateDateTo, setFilterCreateDateTo] = useState('');

    const handleCreateGroup = (event) => {
        createPlace(newPlaceName, newPlaceType, newPlaceAddress, newPlaceNumber)
            .then(response => {
                navigate(0);
            })
            .catch(error => {
                toast('Введенные данные не соответствуют требованиям!');
            })
    }

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
        getPlaces(currentPage, pageSize, filter).then((response) => {
            setPlaces(response.places_list);
        });
    }

    useEffect(() => {
        setSearchParams({page: currentPage, page_size: pageSize});
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
        getPlaces(currentPage, pageSize, filter).then((response) => {
            setPlaces(response.places_list);
            setTotalPages(Math.ceil(response.count / pageSize));
        });
    }, [currentPage]);

    const handlePreviousClick = (event) => {
        if (currentPage === 1) {
            toast('Ты уже на первой странице!'); 
            return;
        }
        setCurrentPage(currentPage - 1);
    }

    const handleNextClick = (event) => {
        if (currentPage === totalPages) {
            toast('Ты уже на последней странице!'); 
            return;
        }
        setCurrentPage(currentPage + 1);
    }

    return <>
        <div className='flex-row width-full' style={{gap: '20px'}}>
            <Pagination
                pageNumber={currentPage}
                totalPages={totalPages}
                onPreviousClick={handlePreviousClick}
                onNextClick={handleNextClick}
            >
                {
                    places.map((place) => {
                        return <PlaceItem
                            key={place._key}
                            placeId={place._key}
                            name={place.name}
                            creationDate={format(new Date(place.creation_date), 'HH:mm dd.MM.yyyy')}
                            lastEditDate={format(new Date(place.last_edit_date), 'HH:mm dd.MM.yyyy')}
                            avatarUri={place.avatar_uri}
                            type={place.type}
                            address={place.address}
                            number={place.phone_number}
                            area={place.area}
                            equipment={place.equipment}
                        />
                    })
                }
            </Pagination>
            <div className='flex-column fit-width' style={{paddingTop: '80px', gap: '20px'}}>
                <div className='visible-layout flex-column flex-center align-start' style={{padding: '20px', gap: '12px', width: '340px'}}>
                    <div className='caption'>Добавить место</div>
                    <CustomTextField sx={{width: '100%'}} label="Название" value={newPlaceName} onChange={(event) => setNewPlaceName(event.target.value)}/>
                    <CustomTextField sx={{width: '100%'}} label="Тип" value={newPlaceType} onChange={(event) => setNewPlaceType(event.target.value)}/>
                    <CustomTextField sx={{width: '100%'}} label="Адрес" value={newPlaceAddress} onChange={(event) => setNewPlaceAddress(event.target.value)}/>
                    <CustomTextField sx={{width: '100%'}} label="Контактный номер" value={newPlaceNumber} onChange={(event) => setNewPlaceNumber(event.target.value)}/>
                    <CustomButton sx={{alignSelf: 'end'}} variant="contained" onClick={handleCreateGroup}>Создать</CustomButton>
                </div>
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
            </div>
        </div>
    </>;
}
