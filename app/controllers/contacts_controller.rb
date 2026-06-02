class ContactsController < ApplicationController
  def new
    @contact = Contact.new
  end
  def create
    @contact = Contact.new(contact_params)

    if @contact.valid?
      ContactMailer.contact_email(
        @contact.name,
        @contact.email,
        @contact.message
      ).deliver_now

      redirect_to root_path, notice: "送信しました"
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def contact_params
    params.require(:contact).permit(:name, :email, :message)
  end
end
