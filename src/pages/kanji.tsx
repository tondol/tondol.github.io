import { GetStaticProps } from "next"
import { useEffect, useState } from "react"
import styles from "@/styles/Kanji.module.css";
import Link from "next/link";
import Head from 'next/head'

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
    const SOURCE_URL = 'https://gist.githubusercontent.com/tondol/691a25d10fd9554949800924b3ee7ec0/raw/2c0d98b1b61eec9ab0204303473b041a237e19a6/songs.tsv'

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
    isShowedAnswer: boolean
}

export default function Kanji(props: KanjiProps) {
    const { songs } = props
    const KANJI_LENGTH = 8

    const [question, setQuestion] = useState<Question | undefined>(undefined)

    const reloadQuestion = () => {
        const targetSong = songs[Math.floor(Math.random() * songs.length)]
        const startKanjiIndex = Math.floor(Math.random() * (targetSong.kanjiBody.length - KANJI_LENGTH))
        const kanjiPart = targetSong.kanjiBody.substring(startKanjiIndex, startKanjiIndex + KANJI_LENGTH)

        // アニメーションをリセットするためにstateを一度undefinedにする
        setQuestion(undefined)
        requestAnimationFrame(() => {
            setQuestion({
                targetSong,
                kanjiPart,
                isShowedAnswer: false,
            })
        })
    }

    useEffect(() => {
        reloadQuestion()
        return () => {}
    }, [])

    const kanjiChars = question ? question.kanjiPart.split("").map((c, i) => [c, i]) : []

    return (
        <div className={styles.container}>
            <Head>
                <title>漢字八字Aqours楽曲当</title>
            </Head>
            <div className={styles.question}>
                <h2>問題: この漢字を含む楽曲は？</h2>
                <AnimationStyle />
                <p className={styles.questionBody}>
                    {kanjiChars.map((e) => {
                        const kanji = e[0]
                        const index = e[1] as number
                        return (
                            <span key={index} style={{
                                animation: `fadeIn 0.5s ease ${index * 1 + 1}s forwards`,
                                opacity: 0,
                            }}>{kanji}</span>
                        )
                    })}
                </p>
                <p className={styles.showAnswerButton}>
                    <button onClick={() => {
                        if (question) {
                            setQuestion({
                                ...question,
                                isShowedAnswer: true,
                            })
                        }
                    }} disabled={question?.isShowedAnswer}>正解を見る</button>
                </p>
                <p className={styles.reloadButton}>
                    <button onClick={() => {
                        reloadQuestion()
                    }}>次の問題</button>
                </p>
            </div>
            {question?.isShowedAnswer && (
                <div className={styles.answer}>
                    <h2>正解</h2>
                    <p className={styles.answerBody}>
                        <Link href={question.targetSong.sourceUrl} target="_blank">
                            {question.targetSong.title} / {question.targetSong.artist}
                        </Link>
                    </p>
                </div>
            )}
        </div>
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
