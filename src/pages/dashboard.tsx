import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const router = useRouter()

  return (
    <div className='flex flex-column p-5'>
      <h1>Dashboard</h1>
      <h5>Similarity : {router.query?.similarity}</h5>
      <h5>Subject : {router.query?.subject}</h5>
    </div>
  )
}
