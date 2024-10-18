<script>
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      survey: {
        id: null,  
        name: '',  
        description: '',  
        questions: []  
      },
      answers: [], 
      userInfo: {
        name: '', 
        phone: '',  
        email: '',  
        age: null  
      },
      surveyLoaded: false,  
      error: null,  
      isReviewMode: false  
    };
  },
  created() {
    const quizId = this.$route.params.quizId;  
    if (!quizId) {
      console.error('缺少問卷ID');  
      return;
    }

    fetch(`http://localhost:8080/quiz/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",  
      },
      body: JSON.stringify({})  
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('網絡響應錯誤'); 
        }
        return response.json(); 
      })
      .then(data => {
        console.log("成功獲取問卷列表:", data);
        const quiz = data.quizList.find(q => q.id === parseInt(quizId)); 
        if (quiz) {
          this.survey.id = quiz.id;  
          this.survey.name = quiz.name;  
          this.survey.description = quiz.description;  
          this.survey.questions = JSON.parse(quiz.questions);  
          this.initializeAnswers();  
          this.surveyLoaded = true;  
        } else {
          throw new Error('找不到指定ID的問卷');  
        }
      })
      .catch(error => {
        console.error("獲取問卷資料失敗:", error);  
        this.error = '問卷資料加載失敗：' + error.message;  
      });
  },

  methods: {
    initializeAnswers() {
      if (this.survey && Array.isArray(this.survey.questions)) {
        this.answers = this.survey.questions.map(question => {
          return question.type === '文字' ? '' : (question.type === '多選' ? [] : '');
        });  
      } else {
        console.error('問卷問題不是有效的陣列：', this.survey.questions);  
      }
    },
    checkSurvey() {
      this.isReviewMode = true;  
    },
    editSurvey() {
      this.isReviewMode = false;  
    },
    showConfirmation() {
      Swal.fire({
        title: '確認送出問卷？',  
        icon: 'question', 
        showCancelButton: true,
        confirmButtonText: '確認',  
        cancelButtonText: '取消',  
        confirmButtonColor: '#10b981',  
        cancelButtonColor: '#a1a1a1',  
      }).then((result) => {
        if (result.isConfirmed) {
          this.handleSubmit();
        }
      });
    },
    showInputError(message) {
      Swal.fire({
        icon: 'error',  
        title: '錯誤',  
        text: message,  
        confirmButtonColor: '#10b981',  
      });
    },
    handleSubmit() {
      if (!this.isReviewMode) {
        this.checkSurvey();  
        return;
      }

      const formattedAnswers = this.survey.questions.map((question, index) => {
        let answer;
        if (question.type === '多選') {
          if (!Array.isArray(this.answers[index])) {
            console.error(`問題 ${question.title} 的答案不是陣列：`, this.answers[index]);  
            throw new Error(`問題 ${question.title} 的答案不是陣列`);
          }
          answer = this.answers[index].join(';');  
        } else {
          answer = this.answers[index];  
        }

        return {
          question_id: question.id,  
          question: question.title,  
          options: question.options ? question.options : '',  
          answer: answer || '',  
          type: question.type,  
          necessary: question.is_necessary.toString() 
        };
      });

      const submissionData = {
        quiz_id: this.survey.id.toString(), 
        name: this.userInfo.name,  
        phone: this.userInfo.phone,  
        email: this.userInfo.email, 
        age: this.userInfo.age,  
        fillin_list: formattedAnswers  
      };

      fetch("http://localhost:8080/quiz/fillin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",  
        },
        body: JSON.stringify(submissionData)  
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('提交問卷時出錯 ' + response.statusText);  
        }
        return response.json();  
      })
      .then(data => {
        if (data.statusCode !== 200) {
          throw new Error(data.message);  
        }
        console.log("提交成功:", data);  
        Swal.fire({
          icon: 'success',  
          title: '成功',  
          text: '問卷提交成功！',  
          confirmButtonColor: '#10b981',  
        }).then(() => {
          this.$router.push('/Statistics/' + this.survey.id); 
        });
      })
      .catch(error => {
        console.error("提交時發生錯誤:", error);  
        this.showInputError('提交問卷時出錯，請稍後再試。');  
      });
    },
    goBack() {
      this.$router.go(-1);  
    }
  }
};
</script>





<template>
  <div id="app" class="container">
    <div class="header">
      <button class="back-btn" @click="goBack">＜ 返回</button>
    </div>

    <div class="survey-title-area">
      <h1 class="survey-title">{{ survey.name }}</h1>
      <p class="survey-description">{{ survey.description }}</p>
    </div>

    <form v-if="surveyLoaded && survey.questions && survey.questions.length > 0" @submit.prevent="handleSubmit" class="form">
      <div v-if="!isReviewMode" class="user-info">
        <div class="personal-information">
          <h2>個人資料</h2>
        </div>
        <div class="form-group">
          <label for="name">姓名<span v-if="!userInfo.name" style="color: red">*</span></label>
          <input type="text" v-model="userInfo.name" id="name" required placeholder="請輸入您的姓名">
        </div>

        <div class="form-group">
          <label for="phone">電話<span v-if="!userInfo.phone"style="color: red">*</span></label>
          <input type="text" v-model="userInfo.phone" id="phone" required placeholder="請輸入您的電話">
        </div>

        <div class="form-group">
          <label for="email">信箱<span v-if="!userInfo.email"style="color: red">*</span></label>
          <input type="email" v-model="userInfo.email" id="email" required placeholder="請輸入您的電子郵件">
        </div>

        <div class="form-group">
          <label for="age">年齡<span v-if="!userInfo.age"style="color: red">*</span></label>
          <input type="number" v-model="userInfo.age" id="age" required placeholder="請輸入您的年齡">
        </div>
      </div>

      <div class="questions-list">
        <div v-for="(question, index) in survey.questions" :key="index" class="question-item">
          <h2>Q{{ index + 1 }} {{ question.title }} <span v-if="question.is_necessary" style="color: red;">*</span></h2>
          <div class="question-type">類型: {{ question.type }}</div>

          <div v-if="question.type === '單選'">
            <div class="options">
              <div v-for="(option, optIndex) in question.options.split(';')" :key="optIndex" class="option-item">
                <input type="radio" :id="'q' + index + 'option' + optIndex" :name="'question' + index" :value="option" v-model="answers[index]" required :disabled="isReviewMode">
                <label :for="'q' + index + 'option' + optIndex">{{ option }}</label>
              </div>
            </div>
          </div>

          <div v-if="question.type === '多選'">
            <div class="options">
              <div v-for="(option, optIndex) in question.options.split(';')" :key="optIndex" class="option-item">
                <input type="checkbox" :id="'q' + index + 'option' + optIndex" :value="option" v-model="answers[index]" :disabled="isReviewMode">
                <label :for="'q' + index + 'option' + optIndex">{{ option }}</label>
              </div>
            </div>
          </div>

          <div v-if="question.type === '文字'">
            <div class="form-group">
              <label :for="'q' + index + 'answer'">回答<span v-if="!answers[index]" style="color: red;">*</span></label>
              <textarea v-model="answers[index]" :id="'q' + index + 'answer'" rows="4" required :disabled="isReviewMode" placeholder="請輸入您的回答"></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button v-if="!isReviewMode" type="button" class="submit-btn" @click="checkSurvey">檢查</button>
        <button v-if="isReviewMode" type="button" class="submit-btn" @click="editSurvey">返回修改</button>
        <button v-if="isReviewMode" type="button" class="submit-btn" @click="showConfirmation">送出問卷</button>
      </div>

    </form>

    <div v-else-if="surveyLoaded && (!survey.questions || survey.questions.length === 0)">
      <p>此問卷沒有任何問題。</p>
    </div>

    <div v-else>
      <p>問卷加載中...</p>
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
  /* text-align: center; */
      .header {
          width: 100%;
          display: flex;

          /* justify-content: space-between; */
          
          /* align-items: center; */
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
         
    }
    .survey-title-area {
 
          margin-bottom: 20px;
          text-align: center;
          .survey-title {
            
            display: inline-block;
              /* font-size: 1.5em; */
             
            }
          }
        .user-info {
      background-color: #f0f0f0;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
        .form-group {
          margin-top: 20px;
          margin-bottom: 15px;
        
           label {
            font-weight: bolder;
              display: block;
              margin-bottom: 5px;
            }
            input  {
              width: 100%;
              padding: 10px;
              font-size: 1em;
              border: 1px solid #ccc;
              border-radius: 5px;
            }
        }
    }

   
.questions-list {
  margin-top: 20px;
  .question-item {
    
    margin-bottom: 25px;
    padding: 15px;

    background-color: #f9f9f9;
    border-radius: 8px;

    h2{
      /* text-align: center; */
      padding-left:3%;

    }
    .question-type{
      /* text-align: center; */
      font-weight: bolder;
      padding-left:3%;
    }
      
      .options {
        padding-left:3%;
          margin-top: 20px;
          label {
            display: inline-block;
            margin-bottom: 7px;
          cursor: pointer;
        }
        input{
          display: inline-block;
            margin-bottom: 7px;
          margin-right: 10px;
          cursor: pointer;
        
          }
     
     

      }

  }
}

      textarea {
        width: 100%;

        padding: 10px;
        
        font-size: 1em;
        border: 1px solid #ccc;
        border-radius: 5px;
      }

      .form{
        .user-info>.personal-information{
          text-align: center;
        }
      .form-group {
        /* text-align: center; */
        
        margin-top: 20px;
        label{
          /* padding-left:5%; */
          /* text-align: center; */
          padding-left: 3%;
        
          /* display: inline-block; */
          /* margin-bottom: 7px; */
          font-weight: bolder;
        }
        textarea{
          margin-top: 1%;
          padding: 1% 1.5%;
        }
      }
    }
      .form-actions{
        text-align: center;
      .submit-btn {
        display: inline-block;
        
          font-weight: bolder;
          background-color: rgb(170, 198, 215);
          color: rgb(46, 66, 114);
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-right: 10px;
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
