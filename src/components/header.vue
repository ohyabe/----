<script>
import { RouterLink, RouterView } from 'vue-router'
//option API 寫法
export default{

    methods: {
    test() {
        let testObj = {
        "quiz_id": 1,
        "name": "中午要喝啥",
        "description": "金茶伍",
        "start_date": "2024-06-08",
        "end_date": "2024-06-30",
        "question_list": [
    {
            "id": 1,
            "title": "純茶類",
            "options": "紅茶;綠茶;烏龍;青茶",
            "type": "單選",
            "is_necessary": false
        },
        {
            "id": 2,
            "title": "拿鐵類",
            "options": "紅茶拿鐵;綠茶拿鐵;烏龍拿鐵;青茶拿鐵",
            "type": "多選",
            "is_necessary": false   
},
{
            "id": 3,
            "title": "特調類",
            "options": "",
            "type": "文字",
            "is_necessary": false
        }
],

    //components => 放能在<template>中當標籤使用
    components:{
        RouterLink,
    } 
}


fetch("http://localhost:8080/quiz/statistics", {
        method: "POST",
        headers: {
         "Content-Type": "application/json",
        },
        body: JSON.stringify(testObj)
      })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    }
  }
}
</script>

<template>
<div class="headerArea">
    <RouterLink class="page_table" to="/page">問卷總覽</RouterLink>
    <RouterLink class="page_table" to="Question">創建問卷</RouterLink>
    <!-- <RouterLink class="page_table" to="/page1">問卷填寫</RouterLink>
    <RouterLink class="page_table" to="/page2">問卷統計</RouterLink>
    <RouterLink class="page_table" to="/page3">問卷回饋</RouterLink> -->
    <!-- <button @click="test">Send Data</button> -->

    <a class="flex" href="#top"></a>



</div>
</template>

<style scoped lang="scss">
.headerArea{
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 60px;
    margin-bottom: 5%;
    background: rgb(170, 198, 215);
    .page_table{
        display:inline-block;
        width: 15%;
        padding: 10px;
        height: 60px;
        color:rgb(11, 1, 57);
        font-size: 23px;
        text-align: center;
        // margin: 0 0%;
        font-weight: bold;
        text-decoration: none;
        transition: background-color 0.3s ease;
        
        &:hover {
            width: 15%;
            background: rgb(11, 1, 57);
            color: rgb(255, 255, 255);
            transition: background-color 0.3s ease;

            
        }

       
      
    }
    button {
    margin: 20px;
    padding: 10px;
    font-size: 16px;
    }
}

.flex {
            position: fixed;
            z-index: 10;
            right: 15px;
            bottom: 201px;
            width: 5rem;
            height: 5rem;
            border-radius: 25px;
            background-color: rgb(170, 198, 215);
            border:none;
                &::after {
                    content:"";
                    position: relative;
                    width: 0;
                    height: 0;
                    border: 20px solid;
                    border-color: transparent transparent #ffffff transparent;
                    opacity: 0.7;
                    left:20px;
                    top:10px;
                }
        }

</style>