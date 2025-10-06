"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from 'react-i18next'

import {
  PiggyBank,
  TrendingUp,
  Wallet,
  ArrowRightLeft,
  Menu,
  Building2,
