const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const paginator = document.querySelector('#paginator')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const movies = []
let filteredMovies = []
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
          <div class="card-body ">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#movie-modal">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}" >+</button> 
          </div>
        </div>
      </div>
    </div>
    `
  })
  dataPanel.innerHTML = rawHtml
}

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderMovieList(getMoviesByPage(1))
    renderPaginator(movies.length)
    // console.log(movies)
  })
  .catch((err) => console.log(err))

// 選取渲染的 modal 節點, #movie-modal
// 委派監聽器在 data-panel 上面, 判斷 click 是否含有 class='.btn btn-show-movie'

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset)
    // 用 console.log 後的 ID 順序,來判定資料的唯一性,但因為叫出來是字串型態,需要轉成數字型態 
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 用 event.target 的 tagName 是否包含 'A' 連結來進行判斷
  if (event.target.tagName !== 'A') return

  // 頁數是取出 paginator 綁定的 data-page = ${page}
  const page = Number(event.target.dataset.page)

  // 呼叫 function 來 render 畫面，而 getMoviesByPage() 是屬於此頁面已經切割的電影資料
  renderMovieList(getMoviesByPage(page))
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

function addToFavorite(id) {
  // 新增 list 變數,此變數是 localStorage 之中, key 屬性為 'favorite' 的資料
  // 如果沒有此資料, 則將 list 宣告為空陣列
  // (其中 JSON.parse() 是將 JSON 格式的資料轉成 Javascript 的原生物件)
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []

  // 新增一個 movie 變數，存放 movies 陣列中用 .find() 辨別並回傳的第一筆資料
  // 此資料代表帶入 function 的 target.id 與 movies 陣列中同個 id 的資料
  const movie = movies.find((movie) => movie.id === id)

  // 如果 list 中已經有相同 id 的資料, 則會啟動 alert
  // 使用 .some() 進行辨別，但只會回傳 true or false，不會回傳資料
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單之中')
  }

  // 將 movie 的資料 push 進 list
  list.push(movie)

  // 存放進 localStorge 中符合'favoriteMovies' 的 Key 值內，且是用 string 形式存入
  // (其中 JSON.stringify() 是將資料存為 JSON 格式)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 搜尋框 搜尋關鍵字
// 在搜尋框的 "search button" 綁定監聽器,按下 "submit" 後觸發事件

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 大部分瀏覽器會對於 a 元素的連結 or 提交 form 裡的表單內容時會自動刷新頁面
  // 使用 event.preventDefault() 是要求瀏覽器不要進行頁面刷新的預設行為, 將控制權交給 Javascript
  event.preventDefault()

  // 將 input.value 的值存取下來,並添增 trim() 去頭去尾的空格, inLowerCase() 字串轉成小寫進行篩選
  const keyword = searchInput.value.trim().toLowerCase()

  // for...of 迴圈,每個 item 都和 movies array 中的元素比較
  for (const item of movies) {
    if (item.title.toLowerCase().includes(keyword)) {
      filteredMovies.push(item)
    }
  }

  if (filteredMovies.length === 0) {
    return alert(`Cannot find movies with keywords: ` + keyword)
  }

  // 最後將過濾後的電影 array , 選染出來
  console.log(filteredMovies)
  // 搜尋結果的 paginator 也會隨之改變，所以要重新更動
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))

})

const moviesPerPage = 12

function getMoviesByPage(page) {
  // 在最上端已經有設定每分頁都會出現 12 部電影資料
  // 此 fuction 是將 movies 陣列中的 80 筆資料,分成好幾頁
  // 並在第幾頁,取得該頁的電影資料


  // 不管是一般分頁 or 我的最愛分頁,都會用到此 function
  // 因此最後輸出資料時,透過這個 data 變數來判斷是 movies or filteredMovies
  const data = filteredMovies.length ? filteredMovies : movies

  // page 1 = 1 ~ 12
  // page 2 = 13 ~ 24
  // page 3 = 25 ~ 36
  // (page-1) * moviesPerPage
  const startIndex = (page - 1) * moviesPerPage

  // .slice() 切割 movies 陣列
  // 輸入的兩個參數為切割的 '始' 與 '末'
  return data.slice(startIndex, startIndex + moviesPerPage)

}


function renderPaginator(amount) {
  // 分頁欄會因為資料總數的不同, 而顯示該有的分頁數量
  // movies 資料共有 80 部電影(將會帶入 amount 參數), 每個分頁會顯示 12 部
  // 因此分頁欄的數量會是 (movies.length / moviesPerPage) 然後無條件進位(除不盡還是需要顯示)
  const numberOfPages = Math.ceil(amount / moviesPerPage)
  let rawHtml = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHtml += `
      <li class= "page-item"> <a class="page-link" href="#" data-page="${page}" >${page}</a></li>
    `
  }

  paginator.innerHTML = rawHtml

}