import engine from 'store/src/store-engine';
import storage from 'store/storages/sessionStorage';
import observePlugin from 'store/plugins/observe';

const store = engine.createStore([storage], [observePlugin]);

export default store;
