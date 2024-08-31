import { GetStaticProps } from "next"
import path from "path"
import fs from 'fs'
import { useEffect, useState } from "react"

type Song = {
    title: string
    artist: string
    sourceUrl: string
    kanjiBody: string
}
type FooProps = {
    songs: Array<Song>
}

export const getStaticProps: GetStaticProps<FooProps> = async (context) => {
    const tsvPath = path.join(process.cwd(), 'src', 'data', 'songs.tsv')
    const tsvData = fs.readFileSync(tsvPath, 'utf-8')
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
    targetSong: Song
    kanjiPart: string
}

export default function Foo(props: FooProps) {
    const { songs } = props
    const KANJI_LENGTH = 8

    const [question, setQuestion] = useState<Question | undefined>(undefined)
    const [isShowedAnswer, setShowedAnswer] = useState(false)

    useEffect(() => {
        const targetSong = songs[Math.floor(Math.random() * songs.length)]
        const startKanjiIndex = Math.floor(Math.random() * (targetSong.kanjiBody.length - KANJI_LENGTH))
        const kanjiPart = targetSong.kanjiBody.substring(startKanjiIndex, startKanjiIndex + KANJI_LENGTH)
        setQuestion({
            targetSong,
            kanjiPart,
        })
        return () => {}
    }, [])

    return question ? (
        <>
            <h2>Q: この漢字を含む楽曲は？</h2>
            <p>{question.kanjiPart}</p>
            <p><button onClick={() => {
                setShowedAnswer(true)
            }} disabled={isShowedAnswer}>回答を見る</button></p>
            {isShowedAnswer && (
                <h2>A: {question.targetSong.title} / {question.targetSong.artist}</h2>
            )}
        </>
    ) : (
        <></>
    )
}
