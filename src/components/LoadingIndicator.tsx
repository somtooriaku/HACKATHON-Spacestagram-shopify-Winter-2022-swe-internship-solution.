import '../App.css';
import { usePromiseTracker } from 'react-promise-tracker';
import { ThreeDots } from 'react-loader-spinner';

export default function LoadingIndicator() {
    const { promiseInProgress } = usePromiseTracker();
    return(
        <div className="spinner-container">
            {promiseInProgress && <ThreeDots color="var(--base09)" height="100" width="100" />}
        </div>
    );
}
