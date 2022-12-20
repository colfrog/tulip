const punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
function removePunctuation(string) {
    return string
    .split('')
    .filter(function(letter) {
        return punctuation.indexOf(letter) === -1;
    })
    .join('');
}

function URLSafe(title) {
    let url = title.toLowerCase();
    url = removePunctuation(url);
    url = url.replace(/ /g, '-');
    return url;
}