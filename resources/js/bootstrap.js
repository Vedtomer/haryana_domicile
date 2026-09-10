import axios from 'axios';
import { getOrCreateDeviceId } from './utils/device';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const deviceToken = getOrCreateDeviceId();
if (deviceToken) {
    window.axios.defaults.headers.common['X-Device-Token'] = deviceToken;
}
