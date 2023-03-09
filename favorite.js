const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')

// 先選取要渲染的 HTML 節點 = dataPanel
// 渲染的 function ,將 movies 陣列中的資料用 foreach 來挑出需要的資料來進行渲染
// 最後寫進 dataPanel 裡
function renderMovieList(data) {
  let rawHtml = ''
  data.forEach(item => {
    // 要取得的資料為 title,image
    // titel , image 資料格式要符合 API 說明書
    rawHtml += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img
            src="${POSTER_URL + item.image}"
            class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#movie-modal">More</button>
            <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}" >X</button> 
          </div>
        </div>
      </div>
    </div>
    `
  })
  dataPanel.innerHTML = rawHtml
}

// 選取渲染的 modal 節點, #movie-modal
// 委派監聽器在 data-panel 上面, 判斷 click 是否含有 class='.btn btn-show-movie'

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset)
    // 用 console.log 後的 ID 順序,來判定資料的唯一性,但因為叫出來是字串型態,需要轉成數字型態 
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

// 選取需要渲染的節點
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-img')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // 提出 request
  axios.get(INDEX_URL + id).then(response => {
    // 儲存獲得的 response (response.data.results)
    const data = response.data.results
    modalTitle.innerText = data.title
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie poster"class="fuid">`
    modalDate.innerText = `Release Date:${data.release_date}`
    modalDescription.innerText = data.description
  })
}


function removeFromFavorite(id) {
  // 需要取得 localStorage 資料中，target.id 在 movies 陣列中的位置
  // 才能運用 splice() 去拿掉資料
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  movies.splice(movieIndex, 1)

  // 拿掉資料後的 movies 陣列，需重新存入 localStorage 
  localStorage.setItem('favorite', JSON.stringify(movies))

  // 最後重新呼叫 fuction renderMovieList, 才會達到自動重新整理的效果
  renderMovieList(movies)
}

renderMovieList(movies)
