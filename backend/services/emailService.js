const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendRideBookingEmail = async (userEmail, userName, rideDetails, bookingDetails) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️  EMAIL_USER or EMAIL_PASS is not set in .env! Skipping email notification.');
        return;
    }

    try {
        const transporter = createTransporter();
        
        const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
          
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background: #3B82F6; color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">🚗 PaddleShare</h2>
              <p style="margin: 5px 0 0;">Ride Confirmed</p>
            </div>

            <!-- Body -->
            <div style="padding: 20px;">
              <p style="font-size: 16px;">Hello ${userName},</p>
              <p>Your ride has been successfully booked. Here are your details:</p>

              <!-- Ride Card -->
              <div style="background: #f9fafb; border-radius: 10px; padding: 15px; margin-top: 15px; line-height: 1.8;">
                
                <p><strong>Ride ID:</strong> ${bookingDetails.ride_id ? bookingDetails.ride_id.toString().slice(-6).toUpperCase() : 'N/A'}</p>
                <p><strong>Driver:</strong> ${rideDetails.driver_name}</p>
                <p><strong>From:</strong> ${rideDetails.pickup_location}</p>
                <p><strong>To:</strong> ${rideDetails.dropoff_location}</p>
                <p><strong>Date:</strong> ${rideDetails.departure_date}</p>
                <p><strong>Time:</strong> ${rideDetails.departure_time}</p>
                <p><strong>Vehicle:</strong> ${rideDetails.vehicle_make || 'N/A'}</p>
                <p><strong>Car Number:</strong> ${rideDetails.vehicle_plate || 'N/A'}</p>
                <p><strong>Fare:</strong> ₹${rideDetails.price_per_seat || 'N/A'}</p>
                <p><strong>Seats Booked:</strong> ${bookingDetails.seats_booked || 1}</p>

              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 25px;">
                <a href="#" style="background: #3B82F6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  View Ride Details
                </a>
              </div>

              <p style="margin-top: 25px;">Happy Journey 🚕</p>

              <p style="font-size: 13px; color: #666;">
                If this ride was not booked by you or you have any queries, please contact support.
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f1f5f9; text-align: center; padding: 10px; font-size: 12px; color: #777;">
              © 2026 PaddleShare
            </div>

          </div>
        </div>
        `;

        const mailOptions = {
            from: `"PaddleShare" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'PaddleShare - Your Ride is Confirmed!',
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
    }
};

module.exports = {
    sendRideBookingEmail
};