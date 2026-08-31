import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeliveryMan } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        deliveryProfile: true
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        email: user?.email,
        phone: user?.phone,
        fullName: user?.profile?.fullName || '',
        avatar: user?.avatar,
        walletBalance: user?.walletBalance || 0
      },
      deliveryProfile: user?.deliveryProfile || null
    });
  } catch (err: any) {
    console.error('Delivery Profile GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const body = await request.json();
    const {
      fullName,
      phone,
      vehicleType,
      vehicleNumber,
      drivingLicense,
      nidNumber,
      emergencyContact,
      preferredZone,
      division,
      district,
      upazila
    } = body;

    // Update User & Profile
    if (fullName || phone) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          phone: phone || undefined,
          profile: {
            upsert: {
              create: { fullName: fullName || '' },
              update: { fullName: fullName || undefined }
            }
          }
        }
      });
    }

    // Update DeliveryProfile
    const updatedProfile = await prisma.deliveryProfile.upsert({
      where: { userId },
      update: {
        vehicleType: vehicleType || undefined,
        vehicleNumber: vehicleNumber !== undefined ? vehicleNumber : undefined,
        drivingLicense: drivingLicense !== undefined ? drivingLicense : undefined,
        nidNumber: nidNumber !== undefined ? nidNumber : undefined,
        emergencyContact: emergencyContact !== undefined ? emergencyContact : undefined,
        preferredZone: preferredZone !== undefined ? preferredZone : undefined,
        division: division !== undefined ? division : undefined,
        district: district !== undefined ? district : undefined,
        upazila: upazila !== undefined ? upazila : undefined
      },
      create: {
        userId,
        vehicleType: vehicleType || 'BIKE',
        vehicleNumber: vehicleNumber || null,
        drivingLicense: drivingLicense || null,
        nidNumber: nidNumber || null,
        emergencyContact: emergencyContact || null,
        preferredZone: preferredZone || 'Dhaka Central',
        division: division || null,
        district: district || null,
        upazila: upazila || null,
        status: 'APPROVED',
        availabilityStatus: 'OFFLINE'
      }
    });

    // Fetch updated user with profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, deliveryProfile: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery partner profile updated successfully.',
      user: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        phone: updatedUser?.phone,
        fullName: updatedUser?.profile?.fullName || '',
        avatar: updatedUser?.avatar,
        walletBalance: updatedUser?.walletBalance || 0
      },
      deliveryProfile: updatedUser?.deliveryProfile || updatedProfile
    });
  } catch (err: any) {
    console.error('Delivery Profile PUT API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
