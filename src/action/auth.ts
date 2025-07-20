'use server'

import { prismaClient } from '@/lib/prismaClient'
import { currentUser } from '@clerk/nextjs/server'

export const onAuthenticateUser = async () => {
  try {
    const user = await currentUser()
    if (!user) {
      return { status: 403 }
    }

    const userExist = await prismaClient.user.findUnique({
      where: {
        clerkId: user.id,
      },
      include:{
        aiAgents: true,
      }
    })

    if (userExist) {
      return {
        status: 200,
        user: userExist,
      }
    }

    // Check if user with this email already exists
    const existingEmailUser = await prismaClient.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
      include:{
        aiAgents: true,
      }
    })

    if (existingEmailUser) {
      // Update the existing user with new clerkId
      const updatedUser = await prismaClient.user.update({
        where: {
          email: user.emailAddresses[0].emailAddress,
        },
        data: {
          clerkId: user.id,
          name: user.firstName + ' ' + user.lastName,
          profileImage: user.imageUrl,
        },
        include:{
          aiAgents: true,
        }
      })
      return {
        status: 200,
        user: updatedUser,
      }
    }

    const newUser = await prismaClient.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName + ' ' + user.lastName,
        profileImage: user.imageUrl,
      },
    })

    if (newUser) {
      return { status: 201, user: newUser }
    }
    return { status: 400 }
  } catch (error) {
    console.log('🔴 ERROR', error)
    return { status: 500, error: 'Internal Server Error' }
  }
}
