import './Pagination.css';

import Button from '@mui/material/Button';
import { CustomButton } from '../CustomMuiComponents.js';

export default function Pagination(props) {

    return <>
        <div className='flex-column width-full' style={{gap: '20px', padding: '20px'}}>
            <div className='flex-row width-full flex-space align-center'>
                <CustomButton variant='contained'
                    onClick={props.onPreviousClick}
                >Назад</CustomButton>
                <div style={{padding: '10px 10px 10px 10px', backgroundColor: 'var(--primary-color', color: 'var(--secondary-color)', borderRadius: '10px'}}>Страница {props.pageNumber}/{props.totalPages}</div>
                <CustomButton variant='contained'
                    onClick={props.onNextClick}
                >Далее</CustomButton>
            </div>
            <div className='flex-column width-full' style={{gap: '10px'}}>
                {
                    props.children
                }
            </div>
        </div>
    </>;
}
