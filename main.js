import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const input = document.querySelector('.custom-input');
const btn = document.querySelector('.custom-button');
const loadMoreBtn = document.querySelector('.load-more-btn');
const galleryContainer = document.querySelector('.gallery-container');
const loadingOverlay = document.querySelector('.loading-overlay');
const API_KEY = '41313291-32cdbbed0c1b146ceb687e8ad';

const perPage = 40;
let currentPage = 1;
let searchTerm = '';
let totalHits = 0;

async function serviceGallery(page, search) {
  const BASE_URL = 'https://pixabay.com/api/';

  const queryParams = new URLSearchParams({
    key: API_KEY,
    q: search,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: perPage,
  });

  try {
    const response = await axios.get(`${BASE_URL}?${queryParams}`);
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
}

function buildApiUrl(searchTerm) {
  const apiUrl = getBaseUrl();
  apiUrl.searchParams.append('q', searchTerm);
  return apiUrl.toString();
}

function galleryMarkup(arr) {
  const markup = arr
    .map(
      image => `
        <a href="${image.largeImageURL}" class="image-card">
          <img src="${image.webformatURL}" alt="${image.tags}">
          <div class="image-info">
            <p>Likes: ${image.likes}</p>
            <p>Views: ${image.views}</p>
            <p>Comments: ${image.comments}</p>
            <p>Downloads: ${image.downloads}</p>
          </div>
        </a>
      `
    )
    .join('');

  galleryContainer.insertAdjacentHTML('beforeend', markup);

  const lightbox = new SimpleLightbox('.gallery-container a', {
    captionsData: 'alt',
    captionsDelay: 250,
  });
  lightbox.refresh();
}

function showError(message) {
  iziToast.error({
    title: 'Something wrong',
    message,
    position: 'topRight',
    progressBarColor: 'rgb(255, 0, 0)',
  });
}

function showInfo(message) {
  iziToast.info({
    title: 'Something wrong',
    message,
    position: 'topRight',
    progressBarColor: 'rgb(255, 0, 0)',
  });
}

function showLoadMoreButton() {
  loadMoreBtn.style.display = 'block';
}

function hideLoadMoreButton() {
  loadMoreBtn.style.display = 'none';
}

function showEndOfResultsMessage() {
  showInfo("We're sorry, but you've reached the end of search results.");
}

async function loadMoreImages() {
  if (
    loadingOverlay.style.display === 'flex' ||
    currentPage * perPage >= totalHits
  ) {
    return;
  }

  loadingOverlay.style.display = 'flex';

  currentPage++;
  try {
    const images = await serviceGallery(currentPage, searchTerm);
    if (images.hits && images.hits.length > 0) {
      galleryMarkup(images.hits);
      if (images.totalHits > currentPage * perPage) {
        showLoadMoreButton();
      } else {
        hideLoadMoreButton();
        showEndOfResultsMessage();
      }
    } else {
      showError('No images found.');
    }
  } catch (error) {
    showError('Error loading more images.');
  } finally {
    loadingOverlay.style.display = 'none';
  }
}

btn.addEventListener('click', async () => {
  searchTerm = input.value.trim();
  currentPage = 1;
  totalHits = 0;
  galleryContainer.innerHTML = '';
  loadingOverlay.style.display = 'flex';

  try {
    const images = await serviceGallery(currentPage, searchTerm);
    if (images.hits && images.hits.length > 0) {
      galleryMarkup(images.hits);
      totalHits = images.totalHits;
      if (images.totalHits > perPage) {
        showLoadMoreButton();
      } else {
        hideLoadMoreButton();
      }
    } else {
      showError('No images found.');
    }
  } catch (error) {
    showError('Error searching for images.');
  } finally {
    loadingOverlay.style.display = 'none';
  }
});

loadMoreBtn.addEventListener('click', loadMoreImages);
