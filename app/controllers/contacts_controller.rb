class ContactsController < ApplicationController
  def new
    @contact = Contact.new
  end

  def create
    return head :bad_request if params[:website].present?

    @contact = Contact.new(contact_params)

    if @contact.valid?
      ContactMailer.contact_email(
        @contact.name,
        @contact.email,
        @contact.message
      ).deliver_now

      redirect_to root_path, notice: t("flash.contacts.sent")
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def contact_params
    params.require(:contact).permit(:name, :email, :message)
  end
end
