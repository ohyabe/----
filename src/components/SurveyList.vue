<script>
import Pagination from './Pagination.vue';
import DatePicker from 'primevue/datepicker';
import Swal from 'sweetalert2';

export default {
  components: {
    Pagination,
    DatePicker
  },
  data() {
    return {
      surveyName: '',
      startDate: '',
      endDate: '',
      surveys: [],
      selectedSurveys: [],
      currentPage: 1,
      perPage: 6,
      today: new Date().toISOString().split('T')[0],
      selectAll: false,
      date: null,
      maxSelectCount: 6
    };
  },
  created() {
    this.loadSurveys();
    window.addEventListener('focus', this.updateSurveysOnReturn);
  },
  beforeUnmount() {
    window.removeEventListener('focus', this.updateSurveysOnReturn);
  },
  computed: {
    filteredSurveys() {
      if (!Array.isArray(this.surveys)) {
        return [];
      }

      return this.surveys.filter(survey => {
        const matchesName = !this.surveyName || survey.name.includes(this.surveyName);
        const matchesStartDate = !this.startDate || new Date(survey.startDate) >= new Date(this.startDate);
        const matchesEndDate = !this.endDate || new Date(survey.endDate) <= new Date(this.endDate);
        return matchesName && matchesStartDate && matchesEndDate;
      });
    },
    paginatedSurveys() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredSurveys.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.filteredSurveys.length / this.perPage);
    },
    isAnySurveySelected() {
      return this.selectedSurveys.length > 0;
    }
  },
  methods: {
    updateSurveysOnReturn() {
      this.loadSurveys();
    },
    searchSurveys() {
      fetch("http://localhost:8080/quiz/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          surveyName: this.surveyName,
          startDate: this.startDate,
          endDate: this.endDate
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log("Success:", data);
        this.surveys = Array.isArray(data.quizList) ? data.quizList : [];
        this.surveys.forEach(survey => {
          survey.status = this.getStatus(survey.startDate, survey.endDate);
        });
        this.saveSurveys();
      })
      .catch(error => {
        console.error("Error:", error);
        alert('問卷搜尋失敗：' + error.message);
      });
    },
    handlePageClick(pageNum) {
      this.currentPage = pageNum;
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.pageCount) {
        this.currentPage++;
      }
    },
    selectAllSurveys() {
      if (this.selectAll) {
        const currentPageSurveyIds = this.paginatedSurveys.map(survey => survey.id);
        this.selectedSurveys = [...new Set([...this.selectedSurveys, ...currentPageSurveyIds])];
      } else {
        const currentPageSurveyIds = this.paginatedSurveys.map(survey => survey.id);
        this.selectedSurveys = this.selectedSurveys.filter(id => !currentPageSurveyIds.includes(id));
      }
    },
    deleteSelectedSurveys() {
      if (this.selectedSurveys.length === 0) {
        return;
      }

      Swal.fire({
        title: '確定要刪除選中的問卷嗎？',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#a1a1a1',
        confirmButtonText: '確定',
        cancelButtonText: '取消'
      }).then((result) => {
        if (result.isConfirmed) {
          const reqBody = { id_list: this.selectedSurveys };

          fetch("http://localhost:8080/quiz/delete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(reqBody)
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            console.log("Success:", data);
            this.surveys = this.surveys.filter(survey => !this.selectedSurveys.includes(survey.id));
            this.saveSurveys();
            Swal.fire({
              title: '問卷已成功刪除',
              icon: 'success',
              confirmButtonColor: '#10b981',
            });
          })
          .catch(error => {
            console.error("Error:", error);
            Swal.fire({
              title: '問卷刪除失敗',
              text: error.message,
              icon: 'error',
              confirmButtonColor: '#10b981',
            });
          });
        }
      });
    },
    loadSurveys() {
      fetch("http://localhost:8080/quiz/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}) 
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log("Success:", data);
        this.surveys = Array.isArray(data.quizList) ? data.quizList : [];
        this.surveys.forEach(survey => {
          survey.status = this.getStatus(survey.startDate, survey.endDate);
        });
        this.saveSurveys();
      })
      .catch(error => {
        console.error("Error:", error);
        alert('問卷加載失敗：' + error.message);
      });
    },
    saveSurveys() {
      localStorage.setItem('surveys', JSON.stringify(this.surveys));
    },
    getStatus(startDate, endDate) {
      const today = new Date().toISOString().split('T')[0];

      if (today < startDate) {
        return '尚未開始';
      } else if (today >= startDate && today <= endDate) {
        return '開放中';
      } else {
        return '已結束';
      }
    },
    getStatusColor(status) {
      if (status === '開放中') {
        return 'green';
      } else if (status === '已結束') {
        return 'red';
      } else {
        return 'black';
      }
    },
    viewFeedback(surveyId) {
      this.$router.push(`/feedback/${surveyId}`);
    }
  }
};
</script>




<template>
  <div>
    <form @submit.prevent="searchSurveys">
      <label style="font-weight: bolder;">
        問卷名稱:
        <input class="text" type="text" v-model.lazy.trim="surveyName" placeholder="請輸入問卷名稱">
        <button type="submit" class="search-btn">搜尋</button>
      </label>
      
      <label style="font-weight: bolder;">
        統計時間:
        <DatePicker v-model="startDate" dateForma="yy/MM/DD" showButtonBar showIcon :showOnFocus="true" style=" border: none;height: 30px;margin-top: 10px;margin-left: 6px;margin-right: 3px;cursor: pointer;" class="blue-datepicker"/>
        到
        <DatePicker v-model="endDate" dateForma="yy/MM/DD" showButtonBar showIcon :showOnFocus="true"  style=" border: none;height: 30px;margin-top: 10px;margin-left: 6px;margin-right: 3px;cursor: pointer;" class="blue-datepicker"/>
      </label>
    </form>

    <table>
      <thead>
        <tr>
          <th><input type="checkbox" v-model="selectAll" @change="selectAllSurveys">刪除</th>
          <th>編號</th>
          <th>名稱</th>
          <th>狀態</th>
          <th>開始時間</th>
          <th>結束時間</th>
          <th>問卷填寫</th>
          <th>統計</th>
          <th>回饋</th> 
          <th>編輯</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="survey in paginatedSurveys" :key="survey.id">
          <td>
            <input type="checkbox" :value="survey.id" v-model="selectedSurveys">
          </td>
          <td>{{ survey.id }}</td>
          <td>{{ survey.name }}</td>
          <td :style="{ color: getStatusColor(survey.status), fontWeight: 'bold' }">{{ survey.status }}</td>
          <td>{{ survey.startDate }}</td>
          <td>{{ survey.endDate }}</td>
          <td>
            <router-link v-if="survey.status === '開放中'" :to="'/fillin/' + survey.id">前往</router-link>
            <span v-else-if="survey.status === '已結束'" style="color: red">已結束</span>
            <span v-else>尚未開始</span>
          </td>
          <td>
            <router-link v-if="survey.status !== '尚未開始'" :to="'/statistics/' + survey.id">查看統計</router-link>
            <span v-else>尚未開始</span>
          </td>
          <td>
            <a @click="viewFeedback(survey.id)" v-if="survey.status !== '尚未開始'" style="cursor: pointer;">查看回饋</a>
            <span v-else>尚未開始</span>
          </td>
          <td>
            <router-link v-if="survey.status === '尚未開始'" :to="'/edit/' + survey.id">問卷編輯</router-link>
            <span v-else>不可編輯</span>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="filteredSurveys.length > 0">
      <button @click="deleteSelectedSurveys" :disabled="!isAnySurveySelected" style="height: 30px;border-radius: 5px;margin-top: 10px;margin-left: 6px;border: 1px solid #ccc;padding: 0 10px;cursor: pointer;">
        刪除勾選問卷
      </button>
    </div>

    <pagination
      :current-page="currentPage"
      :page-count="pageCount"
      :handle-page-click="handlePageClick"
      :prev-page="prevPage"
      :next-page="nextPage"
    />
  </div>
</template>


<style scoped>


form {

  margin-bottom: 20px;
 

      .search-btn {
        cursor: pointer;
        border: none;
        border-radius: 5px;
        margin-left: 15px;
        height:35px;
        width: 50px;
        font-weight: bolder;
        background-color: rgb(170, 198, 215);
        color: rgb(46, 66, 114);
        transition: background-color 0.3s ease;
            &:hover {
            color: white;
            background-color: rgb(46, 66, 114);
          }
        }

      

    .text {
    margin-left: 6px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 85%;
    height: 2rem;
    }
}





table {
  width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          table-layout: fixed;
          width: 100%;
  thead{
          background-color: rgb(170, 198, 215);
          
        }
    th, td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
    font-weight: bolder;

      a {
      font-weight: bolder;
      text-decoration: none;
      color: rgb(46, 66, 114);
      transition: background-color 0.3s ease;
        &:hover {
        color: rgb(170, 198, 215);
      }
    }
  }
}



.blue-datepicker::v-deep .p-inputtext:enabled:focus {
  border-color: var(--p-stone-950);
  box-shadow: 0 0 0 0.05rem var(--p-stone-950);
}

.p-datepicker-day-cell~.p-datepicker-day .p-datepicker-day-selected::v-deep .p-datepicker-day .p-datepicker-day-selected{
  background-color: var(--p-surface-700);
  color:  var(--p-surface-700);
}




</style>
