import './TalentDisplay.css';

import { ReactComponent as VocalIcon } from './assets/vocal.svg';
import { ReactComponent as ElectricGuitarIcon } from './assets/electric-guitar.svg';
import { ReactComponent as AcousticGuitarIcon } from './assets/acoustic-guitar.svg';
import { ReactComponent as DrumsIcon } from './assets/drums.svg';
import { ReactComponent as BassIcon } from './assets/bass.svg';

export default function TalentDisplay(props) {
    switch (props.talent) {
        case 'vocal':
            return <>
                <div className='flex-row align-center' style={{gap: '5px'}}>
                    <VocalIcon style={{width: '30px', height: '30px', fill: 'var(--primary-color)'}} />
                    <div className='talent-name'>Вокал</div>
                </div>
            </>;
        case 'electric-guitar':
            return <>
                <div className='flex-row align-center' style={{gap: '5px'}}>
                    <ElectricGuitarIcon style={{width: '30px', height: '30px', fill: 'var(--primary-color)'}} />
                    <div className='talent-name'>Электрогитара</div>
                </div>
            </>;
        case 'acoustic-guitar':
            return <>
                <div className='flex-row align-center' style={{gap: '5px'}}>
                    <AcousticGuitarIcon style={{width: '30px', height: '30px', fill: 'var(--primary-color)'}} />
                    <div className='talent-name'>Акустическая гитара</div>
                </div>
            </>;
        case 'drums':
            return <>
                <div className='flex-row align-center' style={{gap: '5px'}}>
                    <DrumsIcon style={{width: '30px', height: '30px', fill: 'var(--primary-color)'}} />
                    <div className='talent-name'>Барабаны</div>
                </div>
            </>;
        case 'bass':
            return <>
                <div className='flex-row align-center' style={{gap: '5px'}}>
                    <BassIcon style={{width: '30px', height: '30px', fill: 'var(--primary-color)'}} />
                    <div className='talent-name'>Бас</div>
                </div>
            </>;
        default:
            return <></>;
    };
}
