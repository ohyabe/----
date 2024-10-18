<script>
import Card from 'primevue/card';
import Pagination from '../../components/Pagination.vue';
import 'primeicons/primeicons.css';

export default {
  components: {
    Card,  
    Pagination  
  },
  data() {
    return {
      feedbackData: [],  
      displayedFeedback: [], 
      expandedCards: [],  
      currentPage: 1,
      pageSize: 5 
    };
  },
  computed: {
    pageCount() {
      return Math.ceil(this.feedbackData.length / this.pageSize);
    }
  },
  created() {
    const surveyId = this.$route.params.surveyId; 
    this.loadFeedback(surveyId);  
  },
  methods: {
    goBack() {
      this.$router.push('/page');  
    },
    loadFeedback(surveyId) {
      const testObj = {
        quiz_id: surveyId  
      };

      fetch("http://localhost:8080/quiz/feedback", {
        method: "POST",  
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify(testObj) 
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');  
        }
        return response.json();  
      })
      .then(data => {
        this.feedbackData = data.feedbackList; 
        this.updateDisplayedFeedback();  
      })
      .catch(error => {
        alert('加載回饋資料失敗：' + error.message);  
      });
    },
    updateDisplayedFeedback() {
      const startIndex = (this.currentPage - 1) * this.pageSize; 
      const endIndex = startIndex + this.pageSize;  
      this.displayedFeedback = this.feedbackData.slice(startIndex, endIndex);  
    },
    toggleDetails(index) {
      if (this.expandedCards.includes(index)) {
        this.expandedCards = this.expandedCards.filter(i => i !== index);  
      } else {
        this.expandedCards.push(index);  
      }
    },
    isCardExpanded(index) {
      return this.expandedCards.includes(index);  
    },
    handlePageClick(pageNumber) {
      this.currentPage = pageNumber;  
      this.updateDisplayedFeedback();  
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;  
        this.updateDisplayedFeedback();  
      }
    },
    nextPage() {
      if (this.currentPage < this.pageCount) {
        this.currentPage++;  
        this.updateDisplayedFeedback();  
      }
    }
  }
};
</script>



<template>
  <div class="feedback-container">

    <div class="header">
      <button class="back-btn" @click="goBack">＜ 返回</button>
    </div>
    <h1>問卷回饋</h1>
    <div v-if="feedbackData.length > 0">
      <Card v-for="(feedback, index) in displayedFeedback" :key="index" class="feedback-card">
        <template #header>
          <div class="card-header">
            <h2>{{ feedback.feedbackDetail.userName }} 的問卷回饋</h2>
            <i class="pi" :class="isCardExpanded(index) ? 'pi-angle-up' : 'pi-angle-down'" @click="toggleDetails(index)"></i>
          </div>
        </template>
        <template #content>
          <p><strong>填寫時間：</strong>{{ feedback.fillinDateTime }}</p>
          <p><strong>問卷名稱：</strong>{{ feedback.feedbackDetail.quizName }}</p>
          <div v-if="isCardExpanded(index)">
            <p><strong>問卷描述：</strong>{{ feedback.feedbackDetail.description }}</p>
            <p><strong>開始時間：</strong>{{ feedback.feedbackDetail.startDate }}</p>
            <p><strong>結束時間：</strong>{{ feedback.feedbackDetail.endDate }}</p>
            <p><strong>填寫者姓名：</strong>{{ feedback.feedbackDetail.userName }}</p>
            <p><strong>電話號碼：</strong>{{ feedback.feedbackDetail.phone }}</p>
            <p><strong>電子郵件：</strong>{{ feedback.feedbackDetail.email }}</p>
            <p><strong>年齡：</strong>{{ feedback.feedbackDetail.age }}歲</p>
            <ul>
              <li v-for="(fillin, idx) in feedback.feedbackDetail.fillinList" :key="idx">
                <strong>{{ fillin.question }}：</strong>{{ fillin.answer }}
              </li>
            </ul>
          </div>
        </template>
      </Card>
    </div>
    <div v-else style="text-align: center;font-weight: bold">
      <p>目前尚無回饋資料。</p>
    </div>

    <Pagination
      :current-page="currentPage"
      :page-count="pageCount"
      :handle-page-click="handlePageClick"
      :prev-page="prevPage"
      :next-page="nextPage"
    />
  </div>
</template>


<style scoped>
.feedback-container {
  width: 50%;
  margin: 0 auto;
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
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
    
  }
h1{
  margin-bottom: 2%;
  text-align: center;
  
}
      .feedback-card {
        width: 100%;
      border-radius: 0px;
      overflow: hidden;
      margin-bottom: 20px;
      /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); */
      border-radius: 8px;
      
      .card-header {
      /* background-color: #f5f5f5; */
      background-color: rgb(170, 198, 215);
      padding: 2% 5%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }

    .pi {
      font-size: 1.5rem; /* 調整 icon 的大小 */
    }

   p {
    margin: 2%;
   }

   li{
    margin: 5%;
   }
  }

}


</style>
