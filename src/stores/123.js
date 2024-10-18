import { defineStore } from "pinia";
import {mapState, mapActions} from 'pinia'
export default  defineStore('123', {
    state : () => {
        return {
            page:1,
        }
    },
    getters: {
        pageInfo(){
            return `現在位置:${this.page}`
        }
    },
    actions: {
        nextPage(){
            console.log('this.page',this.page);
        }
    }
})
