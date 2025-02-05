import React, { useState, useEffect } from 'react';
import { BarChart, barElementClasses } from '@mui/x-charts/BarChart';
import MenuItem from '@mui/material/MenuItem'
import { format } from 'date-fns';
import { axisClasses } from '@mui/x-charts/ChartsAxis';

import { CustomSelect } from '../CustomMuiComponents.js';

export default function PlaceChart(props) {

    const [dataset, setDataset] = useState([]);

    const [groupBy, setGroupBy] = useState('name');
    const [valueType, setValueType] = useState('amount');

    const getEntityAttribute = (entity, attribute) => {
        switch (attribute) {
            case 'name':
            case 'address':
            case 'type':
            case 'phone_number':
                return entity[attribute];
            case 'creation_date':
                return format(new Date(entity[attribute]), 'dd.MM.yyyy');
            case 'amount':
                return 1;
        }
        return 0;
    }

    useEffect(() => {
        console.log(props.entities);

        let correlation = new Map();

        for (let entity of props.entities) {
            let attribute = getEntityAttribute(entity, groupBy);

            if (Array.isArray(attribute)) {
                for (let item of attribute) {
                    if (correlation.has(item)) {
                        correlation.set(item, correlation.get(item) + getEntityAttribute(entity, valueType));
                    } else {
                        correlation.set(item, getEntityAttribute(entity, valueType));
                    }
                }
                continue;
            }

            if (correlation.has(attribute)) {
                correlation.set(attribute, correlation.get(attribute) + getEntityAttribute(entity, valueType));
            } else {
                correlation.set(attribute, getEntityAttribute(entity, valueType));
            }
        }

        setDataset(Array.from(correlation).map((item) => {
            return {
                label: item[0],
                value: item[1]
            }
        }));

    }, [props.entities, groupBy, valueType]);

    return <>
        <div
            className='width-full height-full flex-column border-box'
        >
            <div
                className='width-full flex-row border-box flex-center'
                style={{
                    padding: '10px',
                    gap: '10px'
                }}
            >
                <div className='text'>
                    Отобразить
                </div>
                <CustomSelect
                    value={valueType}
                    onChange={(event) => {
                        setValueType(event.target.value);
                    }}
                >
                    <MenuItem value='amount'>Количество</MenuItem>
                </CustomSelect>
                <div className='text'>
                    в зависимости от
                </div>
                <CustomSelect
                    value={groupBy}
                    onChange={(event) => {
                        setGroupBy(event.target.value);
                    }}
                >
                    <MenuItem value='name'>Название</MenuItem>
                    <MenuItem value='address'>Адрес</MenuItem>
                    <MenuItem value='type'>Тип</MenuItem>
                    <MenuItem value='phone_number'>Номер телефона</MenuItem>
                    <MenuItem value='creation_date'>Дата создания</MenuItem>
                </CustomSelect>
            </div>
            <BarChart
                className='width-full'
                sx={(theme) => ({
                    [`.${barElementClasses.root}`]: {
                        fill: 'var(--primary-color)'
                    },
                    [`.${axisClasses.root}`]: {
                        [`.${axisClasses.tick}, .${axisClasses.line}`]: {
                            stroke: 'var(--text-color)'
                        },
                        [`.${axisClasses.tickLabel}`]: {
                            fill: 'var(--text-color)'
                        }
                    }
                })}
                data={dataset}
                xAxis={[{ scaleType: 'band', data: dataset.map((item) => item.label) }]}
                series={[{ data: dataset.map((item) => item.value) }]}
            />
        </div>
    </>;
}
