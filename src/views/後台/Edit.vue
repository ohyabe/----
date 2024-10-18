<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; 
import Swal from 'sweetalert2'; 

export default {
  setup() {
    const route = useRoute(); 
    const router = useRouter(); 

    const currentTab = ref('questions'); 
    const survey = ref({
      name: '',
      description: '', 
      start_date: '', 
      end_date: '', 
      question_list: [],
    });

    const questionType = ref('單選'); 
    const newQuestion = ref(''); 
    const newOptions = ref(''); 
    const newNecessary = ref(false); 
    const editingIndex = ref(-1); 

    const navigateTo = (tab) => { 
      if (tab === 'questions') { 
        if (!survey.value.name.trim() || !survey.value.description.trim() || !survey.value.start_date || !survey.value.end_date) { // 檢查問卷基本資訊是否填寫完整
          Swal.fire({
            title: "問卷內容請填寫完整!", 
            icon: 'warning',
            confirmButtonColor: '#10b981',
          });
          return; 
        }
      }
      currentTab.value = tab; 
    };

    const goBack = () => { 
      router.push({ name: 'page' }); 
    };

    const addQuestion = () => { 
      if (!newQuestion.value.trim()) { 
        Swal.fire({
          title: "請輸入問題內容!",
          text: '輸入錯誤',
          icon: 'error',
          confirmButtonColor: '#10b981',
        });
        return; 
      }
      if (questionType.value !== '文字' && (!newOptions.value || !newOptions.value.includes(';'))) { 
        Swal.fire({
          title: '選項請以分號 ( ; ) 做區隔!', 
          text: '輸入錯誤',
          icon: 'error',
          confirmButtonColor: '#10b981',
        });
        return; 
      }

      const newQ = { 
        title: newQuestion.value, 
        type: questionType.value, 
        is_necessary: newNecessary.value, 
        options: questionType.value !== '文字' ? newOptions.value : '', 
      };

      if (editingIndex.value === -1) { 
        newQ.id = survey.value.question_list.length + 1; 
        survey.value.question_list.push(newQ); 
      } else { 
        survey.value.question_list[editingIndex.value].title = newQ.title; 
        survey.value.question_list[editingIndex.value].type = newQ.type; 
        survey.value.question_list[editingIndex.value].is_necessary = newQ.is_necessary; 
        survey.value.question_list[editingIndex.value].options = newQ.options; 
        editingIndex.value = -1; 
      }

      resetForm(); 
    };

    const editQuestion = (index) => { 
      const q = survey.value.question_list[index]; 
      newQuestion.value = q.title; 
      questionType.value = q.type; 
      newNecessary.value = q.is_necessary; 
      newOptions.value = q.options; 
      editingIndex.value = index; 
    };

    const deleteQuestion = (index) => { 
      Swal.fire({
        title: '確定要刪除這個問題嗎?', 
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#a1a1a1',  
        confirmButtonText: '刪除',
        cancelButtonText: '取消'
      }).then((result) => {
        if (result.isConfirmed) { 
          survey.value.question_list.splice(index, 1);
          survey.value.question_list = survey.value.question_list.map((q, idx) => ({ 
            ...q,
            id: idx + 1
          }));
          Swal.fire({
            title: '已刪除!', 
            text: '問題已從問卷中移除。',
            icon: 'success',
            confirmButtonColor: '#10b981',  
          });
        }
      });
    };

    const resetForm = () => { 
      newQuestion.value = ''; 
      questionType.value = '單選'; 
      newNecessary.value = false; 
      newOptions.value = ''; 
    };

    const showConfirmation = () => { 
      if (!survey.value.question_list.length) { 
        Swal.fire("請先新增問卷資訊!"); 
        return; 
      }
      submitForm(); 
    };

    const submitForm = () => { 
      const payload = { 
        id: route.params.id || null, 
        name: survey.value.name, 
        description: survey.value.description, 
        start_date: survey.value.start_date, 
        end_date: survey.value.end_date, 
        question_list: survey.value.question_list, 
      };

      fetch("http://localhost:8080/quiz/create_update", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload) 
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.statusCode === 200 && data.message === 'Success!!') { 
          Swal.fire({
            title: "新增或更新問卷成功!", 
            text: "將於三秒後自動導回列表頁!",
            icon: "success",
            confirmButtonColor: '#10b981',
          });
          setTimeout(() => {
            router.push({ name: 'page' }); 
          }, 3000); 
        } else {
          Swal.fire({
            icon: "error", 
            title: "新增或更新問卷失敗!",
            text: "請重新操作!",
            confirmButtonColor: '#10b981',
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          icon: "error", 
          title: "新增或更新問卷失敗!",
          text: "請重新操作!",
          confirmButtonColor: '#10b981',
        });
      });
    };

    const fetchData = () => { 
      const id = route.params.id; 
      if (id) {
        fetch(`http://localhost:8080/quiz/search`, { 
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }) 
        })
        .then(response => response.json())
        .then(data => {
          const quiz = data.quizList.find(q => q.id === parseInt(id)); 
          if (quiz) {
            survey.value.name = quiz.name; 
            survey.value.description = quiz.description; 
            survey.value.start_date = quiz.startDate; 
            survey.value.end_date = quiz.endDate;
            survey.value.question_list = JSON.parse(quiz.questions).map(q => ({ 
              id: q.id,
              title: q.title,
              type: q.type,
              is_necessary: q.is_necessary,
              options: q.options,
            }));
          }
        })
        .catch(error => {
          console.error("Error fetching data:", error); 
        });
      }
    };

    onMounted(fetchData); 

    return { 
      currentTab,
      survey,
      questionType,
      newQuestion,
      newOptions,
      newNecessary,
      editingIndex,
      navigateTo,
      goBack,
      addQuestion,
      editQuestion,
      deleteQuestion,
      resetForm,
      showConfirmation,
    };
  }
};
</script>






<template>
  <div id="app" class="container">
    <div class="header">
      <button class="back-btn" @click="goBack">＜ 返回</button>
    </div>
    <h1 class="survey-title" style="font-weight: bold;">編輯問卷</h1>
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
        <input type="date" id="start-date" v-model="survey.start_date">
      </div>
      <div class="form-group">
        <label for="end-date" style="font-weight: bold;">問卷截止日期</label>
        <input type="date" id="end-date" v-model="survey.end_date">
      </div>
      <div class="questions-list">
        <div v-for="(question, index) in survey.question_list" :key="index" class="question-item">
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
        <button class="add-btn" @click="addQuestion">{{ editingIndex !== -1 ? '保存修改' : '＋ 添加問題' }}</button>
      </div>
      <div class="form-actions">
        <button class="publish-btn" @click="showConfirmation">保存問卷</button>
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
      font-weight: bolder;
        background-color: rgb(170, 198, 215);
        color: rgb(46, 66, 114);
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin: 0 0.8%;
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
