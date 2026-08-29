import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: {
        Spinner,
        LevelAuthors,
    },

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-list">

            <!-- LEVEL LIST -->
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list" :key="i">

                        <td class="rank">
                            <p v-if="i + 1 <= 150" class="type-label-lg">
                                #{{ i + 1 }}
                            </p>

                            <p v-else class="type-label-lg">
                                Legacy
                            </p>
                        </td>

                        <td
                            class="level"
                            :class="{
                                active: selected === i,
                                error: !level
                            }"
                        >
                            <button @click="selected = i">
                                <span class="type-label-lg">
                                    {{ level?.name || \`Error (\${err}.json)\` }}
                                </span>
                            </button>
                        </td>

                    </tr>
                </table>
            </div>

            <!-- LEVEL CONTENT -->
            <div class="level-container">

                <div class="level" v-if="level">

                    <h1>{{ level.name }}</h1>

                    <LevelAuthors
                        :author="level.author"
                        :creators="level.creators"
                        :verifier="level.verifier"
                    ></LevelAuthors>


                    <!-- YOUTUBE -->
                    <iframe
                        v-if="isYouTube"
                        class="video"
                        id="videoframe"
                        :src="video"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen
                    ></iframe>


                    <!-- MEDAL -->
                    <div
                        v-else-if="isMedal"
                        class="video medal-video"
                    >

                        <div class="medal-message">

                            <h2>Verification Video</h2>

                            <p>
                                This verification video is hosted on Medal.
                            </p>

                            <a
                                :href="level.verification"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="medal-button"
                            >
                                Watch on Medal
                            </a>

                        </div>

                    </div>


                    <!-- OTHER VIDEO -->
                    <div
                        v-else
                        class="video medal-video"
                    >

                        <div class="medal-message">

                            <h2>Verification Video</h2>

                            <a
                                :href="level.verification"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="medal-button"
                            >
                                Open Verification Video
                            </a>

                        </div>

                    </div>


                    <!-- STATS -->
                    <ul class="stats">

                        <li>
                            <div class="type-title-sm">
                                Points when completed
                            </div>

                            <p>
                                {{ score(
                                    selected + 1,
                                    100,
                                    level.percentToQualify
                                ) }}
                            </p>
                        </li>

                        <li>
                            <div class="type-title-sm">
                                ID
                            </div>

                            <p>{{ level.id }}</p>
                        </li>

                        <li>
                            <div class="type-title-sm">
                                Password
                            </div>

                            <p>
                                {{ level.password || "Free to Copy" }}
                            </p>
                        </li>

                    </ul>


                    <!-- RECORDS -->
                    <h2>Records</h2>

                    <p v-if="selected + 1 <= 75">
                        <strong>{{ level.percentToQualify }}%</strong>
                        or better to qualify
                    </p>

                    <p v-else-if="selected + 1 <= 150">
                        <strong>100%</strong>
                        or better to qualify
                    </p>

                    <p v-else>
                        This level does not accept new records.
                    </p>

                    <table class="records">

                        <tr
                            v-for="(record, index) in (level.records || [])"
                            :key="index"
                            class="record"
                        >

                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>

                            <td class="user">
                                <a
                                    :href="record.link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="type-label-lg"
                                >
                                    {{ record.user }}
                                </a>
                            </td>

                            <td class="mobile">

                                <img
                                    v-if="record.mobile"
                                    :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`"
                                    alt="Mobile"
                                />

                            </td>

                            <td class="hz">
                                <p>{{ record.hz }}Hz</p>
                            </td>

                        </tr>

                    </table>

                </div>


                <!-- NO LEVEL -->
                <div
                    v-else
                    class="level empty-level"
                >
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>

            </div>


            <!-- META -->
            <div class="meta-container">

                <div class="meta">

                    <div
                        class="errors"
                        v-show="errors.length > 0"
                    >

                        <p
                            class="error"
                            v-for="error in errors"
                            :key="error"
                        >
                            {{ error }}
                        </p>

                    </div>


                    <!-- EDITORS -->
                    <template v-if="editors">

                        <h3>List Editors</h3>

                        <ol class="editors">

                            <li
                                v-for="editor in editors"
                                :key="editor.name"
                            >

                                <img
                                    :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`"
                                    :alt="editor.role"
                                />

                                <a
                                    v-if="editor.link"
                                    class="type-label-lg link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    :href="editor.link"
                                >
                                    {{ editor.name }}
                                </a>

                                <p v-else>
                                    {{ editor.name }}
                                </p>

                            </li>

                        </ol>

                    </template>


                    <!-- REQUIREMENTS -->
                    <h3>Submission Requirements</h3>

                    <p>
                        Achieved the record without using hacks
                        (however, FPS bypass is allowed, up to 360fps)
                    </p>

                    <p>
                        Achieved the record on the level that is listed
                        on the site - please check the level ID before
                        you submit a record
                    </p>

                    <p>
                        Have either source audio or clicks/taps in the video.
                        Edited audio only does not count
                    </p>

                    <p>
                        The recording must have a previous attempt and
                        entire death animation shown before the completion,
                        unless the completion is on the first attempt.
                        Everyplay records are exempt from this
                    </p>

                    <p>
                        The recording must also show the player hit the
                        endwall, or the completion will be invalidated.
                    </p>

                    <p>
                        Do not use secret routes or bug routes
                    </p>

                    <p>
                        Do not use easy modes, only a record of the
                        unmodified level qualifies
                    </p>

                    <p>
                        Once a level falls onto the Legacy List, we accept
                        records for it for 24 hours after it falls off,
                        then afterwards we never accept records for said level
                    </p>

                </div>

            </div>

        </main>
    `,

    data() {
        return {
            list: [],
            editors: [],
            loading: true,
            selected: 0,
            errors: [],
            roleIconMap,
            store,
        };
    },

    computed: {

        level() {
            if (!this.list || !this.list[this.selected]) {
                return null;
            }

            return this.list[this.selected][0];
        },

        isMedal() {
            if (!this.level?.verification) {
                return false;
            }

            return this.level.verification
                .toLowerCase()
                .includes("medal.tv");
        },

        isYouTube() {
            if (!this.level?.verification) {
                return false;
            }

            const url = this.level.verification.toLowerCase();

            return (
                url.includes("youtube.com") ||
                url.includes("youtu.be")
            );
        },

        video() {
            if (!this.level?.verification) {
                return "";
            }

            return embed(this.level.verification);
        },
    },

    async mounted() {

        this.list = await fetchList();
        this.editors = await fetchEditors();

        if (!this.list) {

            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];

        } else {

            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );

            if (!this.editors) {
                this.errors.push(
                    "Failed to load list editors."
                );
            }
        }

        this.loading = false;
    },

    methods: {
        embed,
        score,
    },
};
