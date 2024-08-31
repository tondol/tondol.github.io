import { GetStaticProps } from "next"
import { useEffect, useState } from "react"
import styles from "@/styles/Kanji.module.css";

type KanjiSong = {
    title: string
    artist: string
    sourceUrl: string
    kanjiBody: string
}
type KanjiProps = {
    songs: Array<KanjiSong>
}

export const getStaticProps: GetStaticProps<KanjiProps> = async (context) => {
    const SOURCE_URL = 'https://gist.githubusercontent.com/tondol/691a25d10fd9554949800924b3ee7ec0/raw/b2dac3fd817b96b38b32fd243d773ac48a8b923e/songs.tsv'

    const res = await fetch(SOURCE_URL)
    const tsvData = await res.text()
    const songs = tsvData.split("\n").map((line, i) => {
        const records = line.split("\t")
        // ヘッダー行とデータが不完全な行は取り除く
        if (i >= 1 && records.length >= 5) {
            return {
                title: records[0],
                artist: records[1],
                sourceUrl: records[2],
                kanjiBody: records[4],
            }
        } else {
            return null
        }
    }).filter((s) => s !== null)
  
    return { props: { songs } }
}

type Question = {
    targetSong: KanjiSong
    kanjiPart: string
}

export default function Kanji(props: KanjiProps) {
    const { songs } = props
    const KANJI_LENGTH = 8

    const [question, setQuestion] = useState<Question | undefined>(undefined)
    const [isShowedAnswer, setShowedAnswer] = useState(false)
    const [isInAnimation, setInAnimation] = useState(false)

    const reloadQuestion = () => {
        const targetSong = songs[Math.floor(Math.random() * songs.length)]
        const startKanjiIndex = Math.floor(Math.random() * (targetSong.kanjiBody.length - KANJI_LENGTH))
        const kanjiPart = targetSong.kanjiBody.substring(startKanjiIndex, startKanjiIndex + KANJI_LENGTH)
        setQuestion({
            targetSong,
            kanjiPart,
        })
        setShowedAnswer(false)

        // アニメーションをリセットするためにstateを一度falseにする
        setInAnimation(false)
        requestAnimationFrame(() => {
            setInAnimation(true)
        })
    }

    useEffect(() => {
        reloadQuestion()
        return () => {}
    }, [])

    const kanjiChars = question ? question.kanjiPart.split("").map((c, i) => [c, i]) : []

    return question ? (
        <div className={styles.container}>
            <div className={styles.question}>
                <h2>問題: この漢字を含む楽曲は？</h2>
                <AnimationStyle />
                <p className={styles.questionBody}>
                    {kanjiChars.map((e) => {
                        const kanji = e[0]
                        const index = e[1] as number
                        return (
                            <span key={index} style={{
                                animation: isInAnimation ? `fadeIn 0.5s ease ${index * 1 + 1}s forwards` : '',
                                opacity: 0,
                            }}>{kanji}</span>
                        )
                    })}
                </p>
                <p className={styles.showAnswerButton}>
                    <button onClick={() => {
                        setShowedAnswer(true)
                    }} disabled={isShowedAnswer}>回答を見る</button>
                </p>
                <p className={styles.reloadButton}>
                    <button onClick={() => {
                        reloadQuestion()
                    }}>次の問題</button>
                </p>
            </div>
            {isShowedAnswer && (
                <div className={styles.answer}>
                    <h2>回答</h2>
                    <p className={styles.answerBody}>
                        {question.targetSong.title} / {question.targetSong.artist}
                    </p>
                </div>
            )}
        </div>
    ) : (
        <></>
    )
}

const AnimationStyle = () => {
    return (
        <style>
            {`@keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-100px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0px);
                }
            }`}
        </style>
    )
}
