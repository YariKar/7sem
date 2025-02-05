export default function GroupMemberInfo(props) {

    return <>
        <div className='flex-row width-full' style={{minHeight: '60px', gap: '10px'}}>
            <div className='fit-width'>
                <div className='group-avatar-container'>
                    <img className='width-full height-full' style={{objectFit: 'cover'}} alt='' src={props.user.avatar_uri}></img>
                </div>
            </div>
            <div className='flex-column width-full height-full flex-center' style={{maxWidth: 'calc(100% - 70px)', gap: '5px'}}>
                <div className='width-full' style={{position: 'relative'}}>
                    <div className='group-name-text'>
                         {props.user.first_name} {props.user.last_name}
                    </div>
                    <div className='gradient'></div>
                </div>
                <div className='flex-row width-full flex-space'>
                    <div className='group-info-text'>
                        Участник с
                    </div>
                    <div className='group-info-text'>
                        {props.joinDate}
                    </div>
                </div>
            </div>
        </div>
    </>;
}
