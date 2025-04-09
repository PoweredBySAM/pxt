import * as React from 'react';

const green = '#0dc8bd';
const yellow = '#f4c464';
const red = '#f36364';
const empty = '#c2c2c3';

interface SignalProps {
    signal: number;
}

const Signal: React.FC<SignalProps> = ({ signal }) => {
    let Fill1 = empty;
    let Fill2 = empty;
    let Fill3 = empty;
    let hidden = false;
    let signalStrength: 'None' | 'Low' | 'Medium' | 'High' = 'None';
    
    if (signal < -70) {
        signalStrength = 'Low';
    } else if (signal < -50) {
        signalStrength = 'Medium';
    } else if (signal < 0) {
        signalStrength = 'High';
    }

    switch (signalStrength) {
        case 'High':
            Fill1 = green;
            Fill2 = green;
            Fill3 = green;
            break;
        case 'Medium':
            Fill2 = yellow;
            Fill3 = yellow;
            break;
        case 'Low':
            Fill3 = red;
            break;
        case 'None':
            hidden = true;
            break;
        default:
            Fill3 = red;
    }

    if (hidden) {
        return null;
    }

    return (
        <svg width='15' height='15' viewBox='0 0 15 15' fill='none'>
            <path
                d='M14.7007 14.7007C14.5156 14.8871 14.2594 15 13.979 15C13.4132 15 12.9555 14.5429 12.9555 13.979C12.9573 10.7914 11.7153 7.79502 9.46135 5.54108C7.20619 3.28531 4.21044 2.04391 1.02286 2.04452C0.457709 2.04512 0 1.58741 0 1.02286C0.000607042 0.45953 0.458316 0.00121408 1.02165 0C4.75496 0.00121408 8.26608 1.45508 10.9061 4.09571C13.5467 6.73756 15 10.2475 15 13.979C15.0006 14.2594 14.8853 14.5156 14.7007 14.7007Z'
                fill={Fill1}
            />
            <path
                d='M10.2053 14.7052C10.0233 14.886 9.77208 14.9994 9.49642 15C8.94093 15 8.49105 14.5495 8.49105 13.9952C8.49105 9.86725 5.13186 6.50847 1.00477 6.50847C0.449881 6.50847 0 6.05976 0 5.50424C0.00119332 4.94991 0.451074 4.49881 1.00477 4.5C6.24045 4.49941 10.5 8.75919 10.5 13.9952C10.5 14.272 10.3878 14.5232 10.2053 14.7052Z'
                fill={Fill2}
            />
            <path
                d='M5.71788 14.7179C5.54335 14.8936 5.30243 15 5.03691 15C4.50415 15 4.07325 14.5691 4.07325 14.0375C4.0721 12.323 2.67754 10.9285 0.964234 10.9285C0.431473 10.9285 0 10.497 0 9.96423C0 9.43147 0.43319 9.00114 0.965379 9C3.73906 9.00114 5.99828 11.2598 6 14.0352C6 14.3019 5.89242 14.5433 5.71788 14.7179Z'
                fill={Fill3}
            />
        </svg>
    );
};

export default Signal; 