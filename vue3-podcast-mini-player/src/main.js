import './assets/main.css'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.min.css"
import "bootstrap"

import { createApp } from 'vue'
import App from './App.vue'

import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';
var app = createApp(App);

app.component('EasyDataTable', Vue3EasyDataTable);

app.mount('#app')
