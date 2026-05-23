class ContactsController < ApplicationController
  def new
  end

  def create
    ContactMailer.contact_email(
      params[:name],
      params[:email],
      params[:message]
    ).deliver_now

    redirect_to new_contact_path, notice: "送信しました"
  end
end
