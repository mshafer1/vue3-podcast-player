<template>
    <div :height="appHeight">
        <div class="container" :hidden="!loaded">

            <div class="container mt-1">
                <div class="row border border-bottom-0">
                    <!-- <div class="col-md-1 d-none d-md-block">&nbsp;</div> -->
                    <div class="col-md-12 col-sm-12">
                        <APlayer :audio="audio" ref="aplayer" loop="false" />
                    </div>
                    <!-- <div class="col-md-1 d-none d-md-block">&nbsp;</div> -->
                </div>
                <div class="row border border-bottom-0" :hidden="!displaySearch">
                    <div class="col-sm-12 text-center">

                        <input type="search" class="form-control" placeholder="search..." @input="updateSearch"
                            v-model="searchText" style="border: none;" />
                    </div>
                </div>
                <div class="row border border-bottom-0">
                    <div class="col-sm-12 text-center">{{ episodes.length }} episodes available</div>
                </div>
                <div class="row">
                    <EasyDataTable buttons-pagination :headers="headers" :items="episodes" :hide-rows-per-page=true
                        body-expand-row-class-name="expanded-row" :rows-per-page="rowsPerPage" :key="rowsPerPage" table-class-name="customize-table"
                        header-class-name="hide-headers" body-row-class-name="customize-rows"
                        header-text-direction="center" @click-row="playRow" :style="{'height': 'calc(' + appHeight + ' - 200px)'}">

                        <template #item-cover="{ cover }">
                            <img :src="cover" class="img-fluid" style="max-width: 80px;" />
                        </template>
                        <template #item-name="item">
                            <b>{{ item.name }}</b> &nbsp;- &nbsp;{{ item.length }} <br />
                            <span class="d-none d-sm-none d-md-inline">{{ item.pubDate }}</span><span class="d-inline d-md-none">{{  item.shortPubDate }}</span>
                            <br v-if="item.expanded" />
                            <span v-html="item.summary" v-if="item.expanded"
                                style="padding-top: 1ex; padding-bottom: 2em;">
                            </span>
                        </template>
                        <template #item-playButton="item">
                            <div class="margin">
                                <button class="btn btn-dark p-3 rounded-circle btn-md" :disabled="item.is_playing"
                                    @click="play(item)"><i class="bi" :class="item.icon"></i></button>
                            </div>
                        </template>
                        <template #expand="item">
                            <div>
                                <span v-html="item.summary"></span>
                            </div>
                        </template>
                    </EasyDataTable>
                </div>
            </div>
        </div>
        <div class="container mt-5" :hidden="loaded">
            <div class="row">
                <div class="col-sm-12 text-center">
                    <div class="text-primary" role="status">
                        <span>{{ message }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import debounce from 'debounce';
import APlayer from "@worstone/vue-aplayer";
import axios from "axios";
import xml2js from "xml2js";
import { fuzzyFilter } from "fuzzbunny";
import dateFormat from "dateformat";

class Episode {
    constructor(name, length, link, image, summary, pubDate, guid, author) {
        this.name = name;
        this.length = length;
        this.url = link;
        this.icon = "bi-play-fill";
        this.summary = summary;
        this.cover = image;
        this.pubDate = new Date(pubDate).toLocaleString();
        this.shortPubDate = dateFormat(new Date(pubDate), "yyyy-mm-dd HH:MM");
        this.guid = guid;
        this.author = author;
        this.lrc = "";

        this.theme = '#41b883'
        this.is_playing = false;
        this.expanded = false;
    }

}

const parsedData = ref(null);
const aplayer = ref(null);
const audio = ref([]);
const loaded = ref(false);
const episodes = ref([]);
const allEpisodes = ref([]);
const headers = ref([
    { text: 'Episode', value: 'cover', width: 100 },
    { text: 'Name', value: 'name' },
    { text: '', value: 'playButton' },
])
const searchText = ref("")
const rss = ref(null);
const message = ref("Loading episodes...")
const displaySearch = ref(true)
const appHeight = ref("95vh")
const rowsPerPage = ref(5)

function searchTriggered() {
    if (searchText.value === "") {
        episodes.value = allEpisodes.value
        return
    }
    var search_result = fuzzyFilter(allEpisodes.value, searchText.value, { fields: ['name', 'summary'] })
    episodes.value = search_result.map((ep) => ep.item)
}

const updateSearch = debounce(searchTriggered, 300)

function loadEpisodes(rss) {
    xml2js.parseString(rss.data, (err, result) => {
        parsedData.value = result;
        result.rss.channel[0].item.forEach((value) => {
            var ep = new Episode(
                value.title[0],
                value['itunes:duration'][0],
                value.enclosure[0]['$'].url,
                value['itunes:image'][0]['$'].href,
                value['itunes:summary'][0].replace("<p>", "").replace("</p>", ""),
                value['pubDate'][0],
                value.guid[0]["_"],
                value['dc:creator'][0],
            );
            allEpisodes.value.push(ep);
        })
        episodes.value = allEpisodes.value;
        loaded.value = true;
    });
}

function playRow(row) {
    if (audio.value.length === 0) {
        play(row)
        return
    }
    else {
        var current_playing = audio.value[0]
        if (current_playing.guid === row.guid) {
            return
        }
    }

    console.log("Playing", row)
    play(row)
}

function play(episode) {
    console.log("Loading", episode.name)

    episodes.value.forEach((ep) => { ep.is_playing = ep.guid === episode.guid })

    aplayer.value.pause()
    aplayer.value.clearList();

    audio.value = [episode]
    aplayer.value.play()
}

onMounted(() => {
    let audios = [];
    let urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('rss')) {
        rss.value = urlParams.get('rss')
    } else {
        message.value = "No RSS feed provided. Pleas add ?rss=... to the URL to load episodes"
        return;
    }

    if (urlParams.has('hideSearch')) {
        displaySearch.value = false
    }

    if (urlParams.has('height')) {
        appHeight.value = urlParams.get('height')
    }

    if (urlParams.has('pageSize')) {
        rowsPerPage.value = urlParams.get('pageSize')
    }
    
    aplayer.value.addList(audios);
    axios.get(rss.value).catch((response) => { console.log("Error", response) })
        .catch((response) => { console.log("failure", response) })
        .then((response) => {
            if (typeof (response) !== "undefined") {
                loadEpisodes(response)
            }
        })
});
</script>

<style lang="css">
html {
    --easy-table-row-height: 100px;
}

button.btn[aria-expanded="true"] {
    writing-mode: vertical-rl;
}

.aplayer {
    height: 100px;
    box-shadow: none;
}

.customize-table {
    --easy-table-header-font-size: 16pt;
    --easy-table-row-height: 100px;
    --easy-table-body-row-font-size: 14pt;
    overflow-y: scroll;
    -webkit-user-select: none;
    /* Safari */
    user-select: none;
    /* Standard syntax */
}


.expanded-row>.expand>div {
    margin-top: 1em;
    margin-bottom: 1.5em;
    margin-left: 2em;
    margin-right: 5em;
}

.customize-rows {
    cursor: pointer;
}

.customize-rows:has(button.btn:disabled) > td:not(.can-expand) {
    opacity: .6;
}


.customize-rows>td>div.margin {
    padding: 15px 5px;
}

thead.hide-headers {
    display: none;
}
</style>