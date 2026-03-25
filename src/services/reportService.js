export const getReportById = async (reportId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const savedReport = sessionStorage.getItem(`mock-report-${reportId}`)
  
        if (!savedReport) {
          reject(new Error('리포트를 찾을 수 없습니다.'))
          return
        }
  
        resolve(JSON.parse(savedReport))
      }, 800)
    })
  }