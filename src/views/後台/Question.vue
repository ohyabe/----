<script>
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      currentTab: 'questions', 
      survey: {
        id: null,  
        name: '',  
        description: '',  
        startDate: '',  
        endDate: '',  
        question_list: [] 
      },
      newQuestion: '',  
      newOptions: '',  
      questionType: '單選',  
      newNecessary: false,  
      questions: [],  
      editingIndex: null  
    };
  },
  methods: {
    goBack() {
      this.$router.push('/page');  
    },
    addQuestion() {
      if (!this.newQuestion) {
        this.showInputError('請輸入問題');  
        return;
      }
      if (this.questionType !== '文字' && !this.newOptions) {
        this.showInputError('請輸入選項');  
        return;
      }
      if (this.questionType !== '文字' && !this.newOptions.includes(';')) {
        this.showInputError('請以分號 ( ; ) 做區隔!');  
        return;
      }
      let options = "";
      if (this.questionType !== '文字') {
        options = this.newOptions.split(';').map(option => option.trim()).join(';');  
      }

      if (this.editingIndex !== null) {
        this.questions[this.editingIndex] = {
          id: this.questions[this.editingIndex].id,
          title: this.newQuestion,
          type: this.questionType,
          options,
          is_necessary: this.newNecessary
        };
        this.editingIndex = null;
      } else {
        const id = this.questions.length + 1;
        this.questions.push({ id, title: this.newQuestion, type: this.questionType, options, is_necessary: this.newNecessary });
      }

      this.newQuestion = '';  
      this.newOptions = '';  
      this.newNecessary = false;  
    },
    editQuestion(index) {
      const question = this.questions[index];  
      this.newQuestion = question.title; 
      this.questionType = question.type;  
      this.newOptions = question.options;  
      this.newNecessary = question.is_necessary; 
      this.editingIndex = index; 
    },
    deleteQuestion(index) {
      Swal.fire({
        title: '確認刪除問題？',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#a1a1a1',
      }).then((result) => {
        if (result.isConfirmed) {
          this.questions.splice(index, 1);  
          this.questions.forEach((question, i) => {
            question.id = i + 1;
          });
          this.showSuccessMessage('問題刪除成功！');
        }
      });
    },
    submitSurvey() {
      if (!this.survey.name) {
        this.showInputError('請輸入問卷名稱');  
        return;
      }
      if (!this.survey.startDate) {
        this.showInputError('請輸入問卷開始日期');  
        return;
      }
      if (!this.survey.endDate) {
        this.showInputError('請輸入問卷截止日期'); 
        return;
      }
      if (this.questions.length === 0) {
        this.showInputError('請添加至少一個問題');  
        return;
      }
      this.survey.question_list = this.questions;  
      this.survey.start_date = this.survey.startDate;  
      this.survey.end_date = this.survey.endDate;  

      fetch("http://localhost:8080/quiz/create_update", {
        method: "POST",  
        headers: {
          "Content-Type": "application/json",  
        },
        body: JSON.stringify(this.survey)  
      })
      .then(response => response.json())  
      .then(data => {
        console.log("Success:", data);  
        this.showSuccessMessage('問卷提交成功！'); 
        let surveys = JSON.parse(localStorage.getItem('surveys')) || [];  
        this.survey.id = surveys.length + 1;  
        this.survey.status = this.getStatus(this.survey.startDate, this.survey.endDate); 
        surveys.push(this.survey);  
        localStorage.setItem('surveys', JSON.stringify(surveys));  
        this.$router.push('/page');  
      })
      .catch(error => {
        console.error("Error:", error);  
        this.showErrorMessage('問卷提交失敗：' + error.message);  
      });
    },
    getStatus(startDate, endDate) {
      const today = new Date().toISOString().split('T')[0];  
      const start = new Date(startDate).toISOString().split('T')[0];  
      const end = new Date(endDate).toISOString().split('T')[0];  
      
      if (today < start) {
        return '尚未開始';  
      } else if (today > end) {
        return '已結束';  
      } else {
        return '開放中'; 
      }
    },
    showInputError(message) {
      Swal.fire({
        icon: 'error', 
        title: '輸入錯誤', 
        text: message,  
        confirmButtonColor: '#10b981',  
      });
    },
    showSuccessMessage(message) {
      Swal.fire({
        icon: 'success',  
        title: '成功',  
        text: message,  
        confirmButtonColor: '#10b981',  
      });
    },
    showErrorMessage(message) {
      Swal.fire({
        icon: 'error',  
        title: '錯誤', 
        text: message,  
        confirmButtonColor: '#10b981',  
      });
    },
    showConfirmation() {
      Swal.fire({
        title: '確認發布問卷？',  
        icon: 'question',  
        showCancelButton: true,  
        confirmButtonText: '確定',  
        cancelButtonText: '取消',  
        confirmButtonColor: '#10b981',  
        cancelButtonColor: '#a1a1a1',  
      }).then((result) => {
        if (result.isConfirmed) {
          this.submitSurvey();  
        }
      });
    }
  }
};
</script>

<template>
  <div id="app" class="container">
    <div class="header">
      <button class="back-btn" @click="goBack">＜ 返回</button>
    </div>
    <h1 class="survey-title" style="font-weight: bold;">創建問卷</h1>
    <div v-show="currentTab === 'questions'" class="form">
      <div class="form-group">
        <label for="survey-name" style="font-weight: bold;">問卷名稱</label>
        <input type="text" id="survey-name" v-model="survey.name" placeholder="請輸入問卷名稱">
      </div>
      <div class="form-group">
        <label for="survey-description" style="font-weight: bold;">問卷描述</label>
        <input type="text" id="survey-description" v-model="survey.description" placeholder="請輸入問卷描述">
      </div>
      <div class="form-group">
        <label for="start-date" style="font-weight: bold;">問卷開始日期</label>
        <input type="date" id="start-date" v-model="survey.startDate" placeholder="yyyy/MM/dd" >
      </div>
      <div class="form-group">
        <label for="end-date" style="font-weight: bold;">問卷截止日期</label>
        <input type="date" id="end-date" v-model="survey.endDate" placeholder="yyyy/MM/dd">
      </div>
      <div class="questions-list">
        <div v-for="(question, index) in questions" :key="index" class="question-item">
          <h2>Q{{ question.id }} {{ question.title }} ({{ question.type }})</h2>
          <div v-if="question.type !== '文字'">
            <div v-for="(option, optIndex) in question.options.split(';')" :key="optIndex">
              選項{{ optIndex + 1 }}: {{ option }}
            </div>
          </div>
          <div>
            <label>必填：{{ question.is_necessary ? '是' : '否' }}</label>
          </div>
          <button @click="editQuestion(index)">編輯</button>
          <button @click="deleteQuestion(index)">刪除</button>  
        </div>
      </div>
      <div class="add-question">
        <div class="question-type-buttons">
          <button class="question-type-btn" :class="{ active: questionType === '單選' }" @click="questionType = '單選'">單選題</button>
          <button class="question-type-btn" :class="{ active: questionType === '多選' }" @click="questionType = '多選'">多選題</button>
          <button class="question-type-btn" :class="{ active: questionType === '文字' }" @click="questionType = '文字'">簡答題</button>
        </div>
        <div class="question-input">
          <input type="text" v-model="newQuestion" placeholder="請輸入問題">
          <textarea v-if="questionType !== '文字'" v-model="newOptions" placeholder="請輸入選項內容，並用；分隔選項"></textarea>
          <div class="necessary-checkbox">
            <input type="checkbox" id="necessary-checkbox" v-model="newNecessary">
            <label for="necessary-checkbox">必填</label>
          </div>
        </div>
        <button class="add-btn" @click="addQuestion">{{ editingIndex !== null ? '保存修改' : '＋ 添加問題' }}</button>
      </div>
      <div class="form-actions">
        <button class="publish-btn" @click="showConfirmation">發布問卷</button>
      </div>
    </div>
  </div>
</template>



<style scoped>
.container {
  width: 50%;
  margin: 50px auto;
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  text-align: center;
      .header {
          width: 100%;
          display: flex;

          justify-content: space-between;
          
          align-items: center;
          margin-bottom: 20px;
      .back-btn {
        font-weight: bolder;
        background-color: rgb(170, 198, 215);
        color: rgb(46, 66, 114);
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      &:hover {
          font-weight: bolder;
          color: white;
          background-color: rgb(46, 66, 114);
        }
       
    }
      .survey-title {
      /* font-size: 24px; */
      /* margin: 0; */
      
    }    
  }
    .form {
      margin-top: 20px;
      
          .form-group {
          margin-bottom: 15px;

             label {
              /* padding: 0% 3%; */
              font-weight: bold;
              font-size: 1rem;
            }

            input{
              margin-top: 10px;
            }
        }
    }


.questions-list {
  margin-top: 20px;

      .question-item {
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 5px;
    }

    .question-item button {
      margin:0 0.8%;
      font-weight: bolder;
        background-color: rgb(170, 198, 215);
        color: rgb(46, 66, 114);
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      &:hover {
          font-weight: bolder;
          color: white;
          background-color: rgb(46, 66, 114);
        }
    }

    h2 {
      
      margin-bottom: 0.5rem;
    }

    div{
      margin-bottom: 2%;
    }

    label {
      font-weight: bold;
    }
}

.add-question {
  margin-top: 20px;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  padding-top: 20px;
}

.question-type-buttons {
  margin-bottom: 25px;
  margin-top: 10px;
  /* margin-left: 35px; */
      .question-type-btn {
          font-weight: bolder;
          width: 30%;
          background-color: rgb(170, 198, 215);
          color: rgb(46, 66, 114);
          padding: 8px 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-right: 10px;
          transition: background-color 0.3s ease;
        }

.question-type-btn.active {
  font-weight: bolder;
  background-color: rgb(46, 66, 114);
  color: rgb(255, 255, 255);
}

}


input,textarea {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;

}



.question-input {
  display: flex;
  flex-wrap: wrap; 
  align-items: center; 
  margin-bottom: 10px;

  input,
  textarea{
    margin-right: 10px;
    margin-bottom: 10px;
  }
 
  .necessary-checkbox {
    display: flex;
    justify-content: center;
    align-items: center; 
    .is-necessary{  
      width: 200px;
      height: 20px;
       }
       input {
        width: 20px;
        height: 20px;
        margin-right: 5px;
        margin-left: 5px;
        margin-bottom: 10px;

       }
    label {
      font-weight: bold;
      margin-left: 5px;
      
    }
 
}
}

.add-btn {
  /* margin-left: 300px; */
  margin-bottom: 1.5rem;
  background-color: rgb(170, 198, 215);
  color: rgb(46, 66, 114);
  font-weight: bolder;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;


    &:hover {
      font-weight: bolder;
      color: white;
      background-color: rgb(46, 66, 114);
    }
}


    .form-actions {
      margin-top: 20px;
      text-align: center;


        .publish-btn {
          /* margin-right:10px;  */
          background-color: rgb(170, 198, 215);
          font-weight: bolder;
          color: rgb(46, 66, 114);
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          &:hover {
            font-weight: bolder;
            color: white;
            background-color: rgb(46, 66, 114);
          }
        }

    }


}


</style>
