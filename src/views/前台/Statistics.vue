<script>
import * as echarts from 'echarts'; 

export default {
  data() {
    return {
      survey: {
        quizName: '', 
        description: '',  
        startDate: '',  
        endDate: '',  
        countMap: {},  
        statusCode: null, 
        message: ''  
      },
      maxCount: 0  
    };
  },
  created() {
    const surveyId = this.$route.params.id;  
    this.fetchSurveyStatistics(surveyId);  
  },
  methods: {
    fetchSurveyStatistics(surveyId) {
      fetch("http://localhost:8080/quiz/statistics", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",  
        },
        body: JSON.stringify({ quiz_id: surveyId })  
      })
      .then((response) => {
        if (!response.ok) {  
          throw new Error('Network response was not ok');
        }
        return response.json();  
      })
      .then((data) => {
        console.log("Success:", data);  
        if (data.statusCode === 200) {  
          this.survey.quizName = data.quizName;  
          this.survey.description = data.description; 
          this.survey.startDate = data.startDate; 
          this.survey.endDate = data.endDate;  
          this.survey.countMap = data.countMap;  
          this.maxCount = Math.max(...Object.values(data.countMap).flatMap(counts => Object.values(counts)));
          this.$nextTick(() => {
            this.renderCharts();  
          });
        } else {
          this.survey.statusCode = data.statusCode;  
          this.survey.message = data.message;  
        }
      })
      .catch((error) => {
        console.error("Error:", error);  
        alert('獲取問卷統計失敗：' + error.message);  
      });
    },
    goBack() {
      this.$router.go(-1);  
    },
    renderCharts() {
    Object.entries(this.survey.countMap).forEach(([key, counts]) => {  
      const chartRef = this.$refs['chart' + key][0];  
      if (chartRef) {
        const myChart = echarts.init(chartRef); 
        const data = Object.entries(counts).map(([name, value]) => ({
          name,
          value
        }));
        
        const option = {
          xAxis: {
            type: 'category',
            data: data.map(item => item.name),
            axisLabel: {
              fontSize: 18,  
              interval: 0,   
            
              margin: 5,  
              color: 'black',  
              show: true

  
            }
          },
          yAxis: {
            type: 'value',
            minInterval: 1,
            beginAtZero: true,
            axisLabel: {
              fontSize: 16  
            }
          },
          series: [
            {
              type: 'bar',  
              data: data.map(item => item.value),
              label: {
                show: true,
                position: 'top',
                fontSize: 35,  
                formatter: '{c} 票'
              },
              itemStyle: {
                color: (params) => {

                  const colors = ['#8600FF', '#00CACA', '#0080FF', '#D9B300', '#484891', '#6C3365', '#613030'];
                  return colors[params.dataIndex % colors.length];
                },
 
              }
            }
          ],
          title: {
            left: 'center',
            top: 20,
            textStyle: {
              fontSize: 20  
            }
          },
          legend: {
            type: 'scroll', 
            textStyle: {
              fontSize: 20 
            }
          }
  
        };
        myChart.setOption(option);  
      }
    });
  }
  }
};
</script>

<template>
  <div class="container">
    <div class="header">
      <button class="back-btn" @click="goBack">＜ 返回</button>
     </div>
    <h1 class="survey-title">{{ survey.quizName || '問卷未找到' }}</h1>
    <div v-if="survey.statusCode === 404" class="error-message">
      <p>{{ survey.message }}</p>
    </div>

    <div v-else class="statistics">

      <p><strong>開始時間:</strong> {{ survey.startDate }}</p>
       <p><strong>結束時間:</strong> {{ survey.endDate }}</p>

      <div v-if="Object.keys(survey.countMap).length > 0">

        <div v-for="(counts, key) in survey.countMap" :key="key" class="option-stat">

          <h3>問題 {{ key }}</h3>

           <div :ref="'chart' + key" class="chart-container"></div>
          

        </div>
      </div>
      <div v-else>
        <p>目前沒有統計資料。</p>
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

          /* justify-content: space-between; */
          
          align-items: center;
          margin-bottom: 20px;

          .back-btn {
              background-color: rgb(170, 198, 215);
              color: rgb(46, 66, 114);
              font-weight: bolder;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
              transition: background-color 0.3s ease;
                &:hover {
                    background-color: rgb(46, 66, 114);
                    color: white;
                    font-weight: bolder;
                    
      }
}
}

  .statistics {
    margin-top: 20px;
    margin-bottom: 20px;
    text-align: center;
    line-height: 2.5;
    p {
      font-size: 1.2rem;
      margin-bottom: 13px;
    }
    .option-stat {
        margin-bottom: 20px;
        padding: 10px;
        border-radius: 4px;
        background-color: #f9f9f9;
      h3{
        font-size: 1.5rem;
      }
            .chart-container {
                width: 100%;
                height: 400px;
              }
      }
  }




}
</style>
