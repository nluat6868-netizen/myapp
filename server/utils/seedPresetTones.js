import mongoose from 'mongoose'
import Tone from '../models/Tone.js'
import User from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config()

const presetTones = [
  {
    name: 'Nhẹ nhàng',
    description: 'Phong cách giao tiếp nhẹ nhàng, dễ chịu',
    style: ['Nhẹ nhàng'],
    formality: 'Thân thiện',
    addressing: 'Bạn',
    isPreset: true,
  },
  {
    name: 'Lịch sự',
    description: 'Phong cách lịch sự, trang trọng, chuyên nghiệp',
    style: ['Lịch sự', 'Chuyên nghiệp'],
    formality: 'Trang trọng',
    addressing: 'Anh/Chị',
    isPreset: true,
  },
  {
    name: 'Thân thiện',
    description: 'Phong cách thân thiện, gần gũi',
    style: ['Thân thiện', 'Vui vẻ'],
    formality: 'Thân thiện',
    addressing: 'Bạn',
    isPreset: true,
  },
  {
    name: 'Chuyên nghiệp',
    description: 'Phong cách chuyên nghiệp, nghiêm túc',
    style: ['Chuyên nghiệp', 'Nghiêm túc'],
    formality: 'Trang trọng',
    addressing: 'Anh/Chị',
    isPreset: true,
  },
]

const seedPresetTones = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp')

    console.log('Connected to MongoDB')

    // Get or create a system user for preset tones
    let systemUser = await User.findOne({ email: 'system@preset.com' })
    if (!systemUser) {
      systemUser = await User.create({
        name: 'System Preset',
        email: 'system@preset.com',
        password: 'preset123456', // This won't be used for login
        role: 'superAdmin',
      })
      console.log('Created system user for preset tones')
    }

    // Delete existing preset tones
    await Tone.deleteMany({ isPreset: true })
    console.log('Deleted existing preset tones')

    // Create preset tones
    const createdTones = []
    for (const toneData of presetTones) {
      const tone = await Tone.create({
        ...toneData,
        user: systemUser._id,
        isPreset: true,
      })
      createdTones.push(tone)
      console.log(`Created preset tone: ${tone.name}`)
    }

    console.log(`\n✅ Successfully created ${createdTones.length} preset tones`)
    console.log('Preset tones are now available for all users')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding preset tones:', error)
    process.exit(1)
  }
}

seedPresetTones()

